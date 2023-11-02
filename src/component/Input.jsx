import React, { useCallback, useEffect, useRef, useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { ToastContainer, toast, Flip } from 'react-toastify';
import OpenAI from 'openai';
import { Editor } from '@toast-ui/react-editor';
import { GrClose } from "react-icons/gr";
import { BiCollapseHorizontal } from "react-icons/bi";
import { BiExpandHorizontal } from "react-icons/bi";
import { PiShirtFoldedFill } from "react-icons/pi";
import { PiTShirtFill } from "react-icons/pi";
import { BiLogoCodepen } from "react-icons/bi";
import { FaCopy } from "react-icons/fa";
import { FaFileArrowUp } from "react-icons/fa6";
import { AiOutlineSend } from "react-icons/ai";
import SkeletonLoading from './SkeletonLoading';

const Input = () => {

  const [text, setText] = useState('create a short blog');
  const editorRef = useRef();
  const inputRef = useRef();
  const [generatedText, setGeneratedText] = useState("");
  const [reGeneratedText, setReReneratedText] = useState([]);
  const [suggestion, setSuggestion] = useState("")
  const [buttonView, setButtonView] = useState(false);
  const [btnPosition, setBtnPosition] = useState({ top: 0, left: 0 });
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const [dialogView, setDialogView] = useState(false);
  const [skeletonView, setSkeletonView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textToChange, setTextToChange] = useState('')

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
    dangerouslyAllowBrowser: true
  });

  const versions = {
    'shorter': 'more shorter and concise',
    'longer': 'more detailed and longer',
    'casual': 'casual and conversational',
    'professional': 'more formal and professional'
  }

  async function main() {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: text }],
      // model: 'gpt-3.5-turbo',
      model: 'gpt-4',
      temperature: 0.5
    });

    await editorRef.current
      .getInstance()
      .setMarkdown(chatCompletion.choices[0].message.content);
    setButtonView(false)
    setDialogView(false)
    setGeneratedText(chatCompletion.choices[0].message.content)
  }

  const generate = async () => {
    if (text.trim() === "") {
      toast.error("please enter the prompt")
      return;
    }

    // inputRef.current.focus()
    // setTimeout(() => {
    //   inputRef.current.setSelectionRange(0, 10)
    // }, 0)

    console.log('generating');
    setIsLoading(true)
    await main();
    setIsLoading(false)
    console.log('done');

  }

  const reGenerate = async (action) => {
    setSkeletonView(true);
    setReReneratedText([]);
    let instruction = versions[action];

    let promptMsg = `Rewrite the following text: '${textToChange}' in a ${instruction} way. Use the following context for understanding the meaning: '${generatedText}'. Don't rewrite the entire context, just provide the rewritten text.`

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: promptMsg }],
      model: 'gpt-4',
      n: 5,
      temperature: 0.5
    });
    setReReneratedText(chatCompletion.choices);
    setSkeletonView(false);
  }

  const generateWithSuggesution = async () => {

    if (suggestion.trim() === "") {
      return toast.error("Please enter your suggestion to generate")
    }

    let promptMsg = `Rewrite the following text: '${textToChange}' in a ${suggestion} way. Use the following context for understanding the meaning: '${generatedText}'. Don't rewrite the entire context, just provide the rewritten text.`

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: promptMsg }],
      model: 'gpt-4',
      n: 5,
      temperature: 0.5
    });

    setReReneratedText(chatCompletion.choices);

  }

  useEffect(() => {
    const handleSelect = (e) => {
      let selectedText = window.getSelection().toString();
      if (selectedText.trim().length !== 0) {
        setButtonView(true);
        setTextToChange(selectedText);
        setBtnPosition({ top: (e.pageY) + "px", left: (9) + "%" })//ok
        //setBtnPosition({ top: (e.pageY) + "px", left: (e.pageX) + "px" })//ok

        // setBtnPosition({ top: (e.layerY + 55) + "px", left: (e.layerX + 30) + "px" })
        // let top = (e.clientY + 45) > window.innerHeight ? e.clientY + 45 : e.clientY - 0;
        // setDialogPosition({ top: (e.clientY + 45) + "px", left: e.clientX + "px" })
        setDialogPosition({ top: (e.pageY + 10) + "px", left: 10 + "%" }) //ok
      } else {
        setButtonView(false);
        setDialogView(false);
        setReReneratedText([])
      }
      selectedText = ''
    };

    // document.addEventListener('select', handleSelect);
    document.getElementById('editor').addEventListener('mouseup', handleSelect);

    return () => {
      // document.removeEventListener('select', handleSelect);
      document.getElementById('editor').addEventListener('mouseup', handleSelect);
    };
  }, []);

  const handleCopy = async (data) => {
    await navigator.clipboard.writeText(data).then(() => {
      toast.success('Copied')
    }).catch(() => {
      toast.error('error on copying')
    })
  }

  const handleInsert = (data) => {

    let scroll = (editorRef.current.getInstance().getScrollTop());
    let newTxt = generatedText.replace(textToChange, data);
    editorRef.current
      .getInstance()
      .setMarkdown(newTxt);
    handleClose();
    setGeneratedText(newTxt)
    setTimeout(() => {
      editorRef.current.getInstance().setScrollTop(scroll);
    }, 0)


    let startIndex = newTxt.indexOf(data);


    // let startIndex = generatedText.indexOf(textToChange);
    editorRef.current.getInstance().setSelection([1, startIndex + 30]);
  }

  const handleClose = () => {
    setDialogView(false)
    setButtonView(false)
    setReReneratedText([])
  }

  // useEffect(() => {
  //   const handleSelect = (e) => {
  //     let selectedText = window.getSelection().toString();

  //     if (window.getSelection().toString() !== "") {
  //       setButtonView(true);
  //       setTextToChange(window.getSelection().toString());
  //       setBtnPosition({ top: (e.clientY) + "px", left: e.clientX + "px" })
  //     } else {
  //       setButtonView(false);
  //     }
  //     selectedText = ''
  //   };

  //   // document.addEventListener('select', handleSelect);
  //   document.addEventListener('mouseup', handleSelect);

  //   return () => {
  //     // document.removeEventListener('select', handleSelect);
  //     document.removeEventListener('mouseup', handleSelect);
  //   };
  // }, []);


  return (
    <>
      <input type="text" id="title" placeholder="Enter your blog post title" value={text} onChange={e => setText(e.target.value)} ref={inputRef} />
      <button id="generate" onClick={generate}>
        {
          isLoading ? (<span></span>) : "Generate"
        }
      </button>
      <div id="editor">
        <Editor
          ref={editorRef}
          initialValue={' '}
          previewStyle="vertical"
          height="600px"
          onselect={() => alert('hi')}
          initialEditType="markdown"
          // initialEditType="wysiwyg"
          useCommandShortcut={true}
        />
        {/* {buttonView ? (<button id="alter-btn" style={btnPosition} onClick={() => {
          setButtonView(false)
          setDialogView(!dialogView)
        }}>
          <BiLogoCodepen />
        </button>) : ""} */}
      </div>
      <div className='dialogControl'>
        {buttonView ? (<button id="alter-btn" style={btnPosition} onClick={() => {
          setButtonView(false)
          setDialogView(!dialogView)
        }}>
          <BiLogoCodepen />
        </button>) : ""}

        {
          (dialogView && !buttonView) ? (
            <div className='dialogBox' style={dialogPosition}>
              <header>
                <div className="iconContainer">
                  <div className="logo"><BiLogoCodepen /></div>
                  <div className="iconBox border">
                    <div className="icon" onClick={() => reGenerate('shorter')}><BiCollapseHorizontal /></div>
                    <div className="icon" onClick={() => reGenerate('longer')}><BiExpandHorizontal /></div>
                  </div>
                  <div className="iconBox">
                    <div className="icon" onClick={() => reGenerate('professional')}><PiShirtFoldedFill /></div>
                    <div className="icon" onClick={() => reGenerate('casual')}><PiTShirtFill /></div>
                  </div>
                </div>
                <div className="closeBtn" onClick={handleClose}><GrClose /></div>
              </header>
              {
                skeletonView && (
                  <SkeletonLoading />
                )
              }
              {
                reGeneratedText.length !== 0 &&
                (<main>
                  {
                    reGeneratedText && (
                      reGeneratedText.map((e, i) => (
                        <div className='createdPrompt' key={i}>
                          {e.message.content}
                          <div className="btnCtrl">
                            <button onClick={() => handleInsert(e.message.content)}><FaFileArrowUp />insert</button>
                            <button onClick={() => handleCopy(e.message.content)}><FaCopy />copy</button>
                          </div>
                        </div>
                      ))
                    )
                  }
                </main>)
              }

              <footer>
                <div>
                  <input type="text" placeholder='Enter Suggestion' value={suggestion} onChange={(e) => setSuggestion(e.target.value)} />
                  <button onClick={generateWithSuggesution}><AiOutlineSend /></button>
                </div>
              </footer>
            </div>
          ) : ""
        }
      </div>


      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Flip}
        theme="dark"
      />
    </>
  )
}

export default Input