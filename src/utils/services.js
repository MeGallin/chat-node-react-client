export const baseUrl = `${import.meta.env.VITE_API_END_POINT}`;

export const postRequest = async (url, body) => {
  const response = await fetch(baseUrl + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await response.json(); // Try to parse JSON
  } catch (e) {
    data = await response.text(); // Fallback for non-JSON response
  }

  if (!response.ok) {
    let message = data || 'An unknown error occurred';
    return { error: true, message };
  }

  return data;
};

export const getRequest = async (url) => {
  const response = await fetch(baseUrl + url);
  const data = await response.json();

  if (!response.ok) {
    let message = data || 'An unknown error occurred';
    return { error: true, message };
  }

  return data;
};

export const deleteRequest = async (url) => {
  const response = await fetch(baseUrl + url, {
    method: 'DELETE',
  });
  const data = await response.json();

  if (!response.ok) {
    let message = data || 'An unknown error occurred';
    return { error: true, message };
  }

  return data;
};
