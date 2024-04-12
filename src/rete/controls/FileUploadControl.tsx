import { ClassicPreset as Classic } from 'rete'
import { useRef } from 'react'

export class FileUploadControl extends Classic.Control {
    file: File | null = null 
    constructor(public onFileUpload: (file: File) => void) {
        super()
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files && files.length > 0) {
            const file = files[0]
            this.file = file 
            this.onFileUpload(file)
        }
    }
}

export function CustomFileUploadControl(props: { data: FileUploadControl }) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.click()
        }
    }

    return (
        <div>
            <input
                type="file"
                accept="audio/*"
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={props.data.handleFileChange}
            />
            <button onClick={handleClick}>
                {props.data.file ? props.data.file.name : 'Upload Audio File'}
            </button>
        </div>
    )
}
