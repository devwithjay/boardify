import Boardify from './broadify';

document.addEventListener('DOMContentLoaded', () => {
  const app = new Boardify();
  app.init();
  document.addEventListener('dragover', e => {
    e.preventDefault();
    app.autoScrollOnDrag(e);
  });
});
