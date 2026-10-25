import { FONTS, PALETTES, TEXT_SIZES, type FontId, type Mode, type PaletteId, type TextSize } from '../lib/themes';
import type { Settings } from '../lib/settings';
import { useStore } from '../state/store';
import { Diagram } from '../diagrams/Diagram';
import { useTitle } from './shared';

function RadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string; style?: React.CSSProperties }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="radio-row">
        {options.map((o) => (
          <label className="choice" key={o.value} style={o.style}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'system', label: 'Match my device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function SettingsPage() {
  useTitle('Settings');
  const { settings, updateSettings } = useStore();
  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => updateSettings({ [k]: v } as Partial<Settings>);

  return (
    <>
      <h1>Settings</h1>
      <p>Changes apply straight away and are saved in this browser. Every theme is checked for WCAG AA colour contrast.</p>
      <RadioGroup<Mode> legend="Appearance" name="mode" value={settings.mode} options={MODES} onChange={set('mode')} />
      <RadioGroup<PaletteId>
        legend="Colour theme"
        name="palette"
        value={settings.palette}
        options={(Object.keys(PALETTES) as PaletteId[]).map((id) => ({ value: id, label: PALETTES[id].label }))}
        onChange={set('palette')}
      />
      <RadioGroup<FontId>
        legend="Font"
        name="font"
        value={settings.font}
        options={(Object.keys(FONTS) as FontId[]).map((id) => ({ value: id, label: FONTS[id].label, style: { fontFamily: FONTS[id].stack } }))}
        onChange={set('font')}
      />
      <RadioGroup<TextSize>
        legend="Text size"
        name="textSize"
        value={settings.textSize}
        options={(Object.keys(TEXT_SIZES) as TextSize[]).map((id) => ({ value: id, label: TEXT_SIZES[id].label }))}
        onChange={set('textSize')}
      />
      <h2>Preview</h2>
      <p>
        Body text looks like this, with <a href="#/settings">a link</a> and <strong>bold words</strong>.
      </p>
      <Diagram id="fee-drag" caption="Diagrams and charts follow your theme." />
    </>
  );
}
