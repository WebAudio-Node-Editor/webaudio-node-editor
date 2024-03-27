import { ClassicPreset as Classic } from 'rete'
import { useRef } from 'react'

export class FileUploadControl extends Classic.Control {
    constructor(public onFileUpload: (file: File) => void) {
        super();
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            this.onFileUpload(file);
        }
    };

}

export function CustomFileUpload(props: { control: FileUploadControl }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="audio/*"
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={props.control.handleFileChange}
            />
            <button onClick={handleClick}>Upload Audio File</button>
        </div>
    );
}
