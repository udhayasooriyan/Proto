import React from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';

import { Editor } from '@toast-ui/react-editor';

const Editer = () => {
    return (
        <div id="editor">
            <Editor
                initialValue="hello react editor world!"
                previewStyle="vertical"
                height="600px"
                // width="90vw"
                initialEditType="markdown"
                useCommandShortcut={true}
            />
        </div>

    )
}

export default Editer