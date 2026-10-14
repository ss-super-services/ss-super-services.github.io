(() => {
  const dialog = document.querySelector('body.services-page #service-phone-dialog');
  if (!dialog) return;
  let opener = null;
  let backdropPress = false;
  document.querySelectorAll('body.services-page .catalog-detail .service-phone-button').forEach(button => {
    button.addEventListener('click', () => {
      if (dialog.open) return;
      opener = button;
      dialog.showModal();
    });
  });
  dialog.querySelector('.service-phone-close').addEventListener('click', () => dialog.close());
  const isOutside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog && isOutside(event); });
  dialog.addEventListener('click', event => {
    if (backdropPress && event.target === dialog && isOutside(event)) dialog.close();
    backdropPress = false;
  });
  dialog.addEventListener('close', () => {
    backdropPress = false;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  });
  // Native showModal supplies inert background, focus trapping, and Escape dismissal.
})();
