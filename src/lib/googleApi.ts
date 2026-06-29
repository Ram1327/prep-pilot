// Base function for calling Google APIs with the OAuth token
export async function callGoogleApi(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: any,
  accessToken?: string
): Promise<any> {
  const token = accessToken || sessionStorage.getItem('google_access_token');
  
  if (!token) {
    throw new Error('Google access token not available. Please sign in with Google.');
  }
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (response.status === 401) {
    // Token expired — user needs to re-sign-in
    sessionStorage.removeItem('google_access_token');
    throw new Error('Session expired. Please sign in with Google again.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Google API error: ${response.status}`);
  }
  
  return response.json();
}

export async function createGmailDraft(
  to: string, subject: string, body: string
): Promise<{ id: string; messageUrl: string }> {
  // Fallback to a placeholder if 'to' is empty or does not contain an email address structure
  const resolvedTo = to && to.trim() && to.includes('@') ? to.trim() : 'recipient@example.com';
  
  // Construct the email in RFC 2822 format
  const email = [
    `To: ${resolvedTo}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body.replace(/\n/g, '<br>'),
  ].join('\r\n');
  
  const encodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const result = await callGoogleApi(
    'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
    'POST',
    { message: { raw: encodedEmail } }
  );
  
  return {
    id: result.id,
    messageUrl: `https://mail.google.com/mail/u/0/#drafts/${result.message.id}`,
  };
}

function ensureValidIsoTimestamp(ts: string, fallbackOffsetHours: number): string {
  if (!ts) {
    return new Date(Date.now() + fallbackOffsetHours * 60 * 60 * 1000).toISOString();
  }
  const date = new Date(ts);
  if (isNaN(date.getTime())) {
    // Fallback if the generated timestamp is a relative text or invalid
    return new Date(Date.now() + fallbackOffsetHours * 60 * 60 * 1000).toISOString();
  }
  return date.toISOString();
}

export async function createCalendarEvent(
  title: string,
  description: string,
  startTime: string, // ISO 8601
  endTime: string,
  attendees?: string[],
  addMeetLink?: boolean
): Promise<{ id: string; htmlLink: string; meetLink?: string }> {
  const validStart = ensureValidIsoTimestamp(startTime, 1);
  const validEnd = ensureValidIsoTimestamp(endTime, 2);

  const event: any = {
    summary: title,
    description,
    start: { dateTime: validStart, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: validEnd, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  };
  
  if (attendees?.length) {
    event.attendees = attendees.map(email => ({ email }));
  }
  
  if (addMeetLink) {
    event.conferenceData = {
      createRequest: {
        requestId: `preppilot-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }
  
  const url = addMeetLink
    ? 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1'
    : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  
  const result = await callGoogleApi(url, 'POST', event);
  
  return {
    id: result.id,
    htmlLink: result.htmlLink,
    meetLink: result.conferenceData?.entryPoints?.find(
      (e: any) => e.entryPointType === 'video'
    )?.uri,
  };
}

export async function scheduleMeeting(
  title: string,
  startTime: string,
  durationMinutes: number,
  attendeeEmails: string[]
): Promise<{ calendarLink: string; meetLink: string }> {
  const validStart = ensureValidIsoTimestamp(startTime, 3);
  const duration = durationMinutes && durationMinutes > 0 ? durationMinutes : 30;
  const endTime = new Date(new Date(validStart).getTime() + duration * 60000).toISOString();
  
  const result = await createCalendarEvent(
    title,
    `Scheduled via PrepPilot for: ${title}`,
    validStart,
    endTime,
    attendeeEmails,
    true // add Meet link
  );
  
  return {
    calendarLink: result.htmlLink,
    meetLink: result.meetLink || '',
  };
}

export async function createGoogleDoc(
  title: string,
  content: string
): Promise<{ docId: string; docUrl: string }> {
  // Step 1: Create the document
  const doc = await callGoogleApi(
    'https://docs.googleapis.com/v1/documents',
    'POST',
    { title }
  );
  
  // Safeguard: Ensure content is not empty
  const docContent = content && content.trim() ? content : `Strategic execution guide and cheatsheet for: ${title}`;

  // Step 2: Insert content into the document
  // Convert markdown-ish content to Google Docs insertText requests
  const requests = [
    {
      insertText: {
        location: { index: 1 },
        text: docContent,
      },
    },
  ];
  
  await callGoogleApi(
    `https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`,
    'POST',
    { requests }
  );
  
  return {
    docId: doc.documentId,
    docUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`,
  };
}

export async function createGoogleSlides(
  title: string,
  slides: Array<{ title: string; bullets: string[] }>
): Promise<{ presentationId: string; presentationUrl: string }> {
  // Step 1: Create the presentation
  const presentation = await callGoogleApi(
    'https://slides.googleapis.com/v1/presentations',
    'POST',
    { title }
  );
  
  const presentationId = presentation.presentationId;
  
  // Safeguard: Ensure slides array is present and has elements
  const slidesData = slides && slides.length > 0 ? slides : [
    { title: title, bullets: ["Strategic overview deck", "Generated via PrepPilot"] }
  ];

  // Step 2: Create slides with content
  // The presentation starts with one blank slide. We'll modify it and add more.
  const requests: any[] = [];
  
  slidesData.forEach((slide, index) => {
    if (index > 0) {
      // Add a new slide for each entry after the first
      requests.push({
        createSlide: {
          insertionIndex: index,
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
          objectId: `slide_${index}`,
        },
      });
    }
  });
  
  // Apply the batch request to create slides
  if (requests.length > 0) {
    await callGoogleApi(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      'POST',
      { requests }
    );
  }
  
  // Step 3: Get the updated presentation to find placeholder IDs
  const updated = await callGoogleApi(
    `https://slides.googleapis.com/v1/presentations/${presentationId}`,
    'GET'
  );
  
  // Step 4: Insert text into each slide's title and body placeholders
  const textRequests: any[] = [];
  
  updated.slides.forEach((slideObj: any, index: number) => {
    if (index >= slidesData.length) return;
    
    const slideData = slidesData[index];
    
    slideObj.pageElements?.forEach((element: any) => {
      if (element.shape?.placeholder?.type === 'TITLE' || element.shape?.placeholder?.type === 'CENTERED_TITLE') {
        textRequests.push({
          insertText: {
            objectId: element.objectId,
            text: slideData.title,
            insertionIndex: 0,
          },
        });
      }
      if (element.shape?.placeholder?.type === 'BODY' || element.shape?.placeholder?.type === 'SUBTITLE') {
        textRequests.push({
          insertText: {
            objectId: element.objectId,
            text: slideData.bullets.map(b => `• ${b}`).join('\n'),
            insertionIndex: 0,
          },
        });
      }
    });
  });
  
  if (textRequests.length > 0) {
    await callGoogleApi(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      'POST',
      { requests: textRequests }
    );
  }
  
  return {
    presentationId,
    presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}
