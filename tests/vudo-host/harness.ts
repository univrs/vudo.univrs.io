const worker = new Worker(new URL('./harness.worker.ts', import.meta.url), { type: 'module' });
worker.onmessage = (e) => {
  (window as any).__vudoHostResult = e.data;
  document.getElementById('out')!.textContent = JSON.stringify(e.data, null, 2);
};
worker.postMessage('run');
