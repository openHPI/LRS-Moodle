// Moodle H5P Custom JavaScript (TESTED WITH MOODLE 4.5.x)
// Use this template to create a custom JavaScript file for your Moodle site.
// This example demonstrates how to catch xAPI events from H5P content and send them to a Trax Logs plugin.
// Replace the token value with the actual token generated in Moodle for web services.

(function () {
  const token = 'your generated token here';

  function catchH5PEvents() {
    if (typeof window.H5P !== 'undefined' && window.H5P.externalDispatcher) {
      window.H5P.externalDispatcher.on('xAPI', function (event) {
        if (!event.data || !event.data.statement) return;

        const endpoint = `${M.cfg.wwwroot}/webservice/rest/server.php`;

        // Build form-encoded body as Moodle expects
        const formData = new URLSearchParams();
        formData.append('wstoken', token);
        formData.append('wsfunction', 'local_openlrs_handle_data');
        formData.append('moodlewsrestformat', 'json');
        formData.append(
          'data',
          JSON.stringify({
            xAPI: event.data.statement,
            metadata: {
              session: {
                context_id: M?.cfg?.courseId || null,
              },
            },
          })
        );

        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
          })
          .then((data) => {
            console.log('xAPI sent successfully:', data);
          })
          .catch((err) => {
            console.error('Error sending xAPI:', err);
          });
      });
    } else {
      const observer = new MutationObserver(() => {
        if (
          typeof window.H5P !== 'undefined' &&
          window.H5P.externalDispatcher
        ) {
          observer.disconnect();
          catchH5PEvents();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  window.addEventListener('load', catchH5PEvents);
})();
