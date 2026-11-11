import { ClockConfig } from '../types/electron';

/** Populate form controls from a ClockConfig object. */
function populateForm(config: ClockConfig): void {
  const useSystem = document.getElementById('use-system-time') as HTMLInputElement;
  const manualTimeInput = document.getElementById('manual-time') as HTMLInputElement;
  const tzOffsetInput = document.getElementById('timezone-offset') as HTMLInputElement;
  const widthInput = document.getElementById('win-width') as HTMLInputElement;
  const heightInput = document.getElementById('win-height') as HTMLInputElement;
  const lockedInput = document.getElementById('locked-position') as HTMLInputElement;

  useSystem.checked = config.useSystemTime !== false;

  if (typeof config.manualTime === 'number') {
    // datetime-local expects "YYYY-MM-DDTHH:mm"
    const d = new Date(config.manualTime);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    manualTimeInput.value = iso;
  } else {
    manualTimeInput.value = '';
  }

  tzOffsetInput.value = typeof config.timezoneOffsetMinutes === 'number'
    ? config.timezoneOffsetMinutes.toString()
    : '';

  widthInput.value = config.width?.toString() ?? '240';
  heightInput.value = config.height?.toString() ?? '240';
  lockedInput.checked = !!config.lockedPosition;

  // Toggle manual-time row visibility
  updateTimeInputVisibility(useSystem.checked);
}

function updateTimeInputVisibility(systemTime: boolean): void {
  const manualRow = document.getElementById('manual-time-row') as HTMLElement;
  if (manualRow) {
    manualRow.style.display = systemTime ? 'none' : 'flex';
  }
}

/** Collect form values into a partial ClockConfig. */
function collectPartial(): Partial<ClockConfig> {
  const useSystem = (document.getElementById('use-system-time') as HTMLInputElement).checked;
  const manualStr = (document.getElementById('manual-time') as HTMLInputElement).value;
  const tzStr = (document.getElementById('timezone-offset') as HTMLInputElement).value;
  const widthStr = (document.getElementById('win-width') as HTMLInputElement).value;
  const heightStr = (document.getElementById('win-height') as HTMLInputElement).value;
  const locked = (document.getElementById('locked-position') as HTMLInputElement).checked;

  const partial: Partial<ClockConfig> = {
    useSystemTime: useSystem,
    lockedPosition: locked
  };

  if (!useSystem && manualStr) {
    const ms = new Date(manualStr).getTime();
    if (!isNaN(ms)) partial.manualTime = ms;
  } else {
    partial.manualTime = undefined;
  }

  if (tzStr.trim() !== '') {
    const parsed = parseInt(tzStr, 10);
    if (!isNaN(parsed)) partial.timezoneOffsetMinutes = parsed;
  } else {
    partial.timezoneOffsetMinutes = undefined;
  }

  const w = parseInt(widthStr, 10);
  if (!isNaN(w) && w >= 80 && w <= 800) partial.width = w;

  const h = parseInt(heightStr, 10);
  if (!isNaN(h) && h >= 80 && h <= 800) partial.height = h;
  return partial;
}

window.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settings-form') as HTMLFormElement;
  const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;
  const useSystemCheckbox = document.getElementById('use-system-time') as HTMLInputElement;

  // Load current config and populate form
  const cfg = await window.electronAPI.getConfig();
  populateForm(cfg);

  // Toggle manual time row when checkbox changes
  useSystemCheckbox.addEventListener('change', () => {
    updateTimeInputVisibility(useSystemCheckbox.checked);
  });

  // Live-update if main process broadcasts a change while settings is open
  window.electronAPI.onConfigUpdated((updatedCfg: ClockConfig) => {
    populateForm(updatedCfg);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const partial = collectPartial();
    await window.electronAPI.updateConfig(partial);
    window.close();
  });

  cancelBtn.addEventListener('click', () => {
    window.close();
  });
});
