import { useId, useState, type DragEvent } from 'react';

type Props = {
  accept: string;
  multiple?: boolean;
  title: string;
  hint: string;
  onFiles: (files: File[]) => void;
  compact?: boolean;
};

/** Drop area that also works as a regular file picker (tap on phones, keyboard with Enter or Space). */
export default function Dropzone({ accept, multiple = false, title, hint, onFiles, compact = false }: Props) {
  const id = useId();
  const [over, setOver] = useState(false);

  const take = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  };

  return (
    <label
      htmlFor={id}
      className={`drop${over ? ' over' : ''}${compact ? ' compact' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => { take(e.target.files); e.target.value = ''; }}
      />
      <span className="drop-ico" aria-hidden="true">+</span>
      <b>{title}</b>
      <small>{hint}</small>
    </label>
  );
}
