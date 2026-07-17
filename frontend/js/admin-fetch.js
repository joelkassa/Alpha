window.adminFetch = async function (url, options) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    alert('Your admin session has expired. Please log in again.');
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }
  return res;
};