"use client";
import {
  Footer,
  LiveCollaborationTrigger,
  MainMenu,
  WelcomeScreen,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import {
  ExcalidrawElement,
  ExcalidrawTextElement,
  NonDeletedExcalidrawElement,
} from "@excalidraw/excalidraw/types/element/types";
import {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useRef, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  NotebookPen,
  WandSparkles,
  Wand,
  AreaChart,
  Trash2,
  ArrowLeft,
  StepForward,
  Expand,
  Sun,
  Moon,
  Minimize,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@liveblocks/client";
import Draggable from "react-draggable";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { formatSeconds } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { convertDownLoadReactComponentToImage } from "@/components/convertComponentToImage";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import Loader2 from "@/components/Loader2";
import { useMyPresence, useOthers, useSelf } from "@liveblocks/react/suspense";
import Image from "next/image";
import { useModal } from "../hooks/useModal";
import Cursor from "../Cursor";
// import { useMyPresence } from "../../../liveblocks.config";



const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);

const FunctionGraph = dynamic(async () => await import("@/components/graphs/function"), {
  ssr: false,
});

interface CanvasProps {

  params: {
    id: string;
  },
  session: Session | null,
  setSession: Dispatch<SetStateAction<Session | null>>
}

const Canvas: React.FC<CanvasProps> = ({ params, session }) => {
  const [client, setclient] = useState<any>(null)
  // const presence = useMyPresence()
  const [{ cursor }, updateMyPresence] = useMyPresence();

  const [room, setRoom] = useState<any>(null)
  const [leave, setLeave] = useState<any>(null)
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const [initialData, setInitialData] = useState<ExcalidrawInitialDataState>();
  const [currentElements, setCurrentElements] = useState<
    readonly NonDeletedExcalidrawElement[]
  >([]);
  const [activeTextElement, setActiveTextElement] = useState<
    ExcalidrawElement[]
  >([]);
  const [currentYoutubeLink, setCurrentYoutubeLink] = useState<string>("");
  const [activeEmbeddable, setActiveEmbeddable] = useState<ExcalidrawElement[]>(
    [],
  );
  const { onOpen } = useModal()

  const [canvasPrompts, setcanvasPrompts] = useState<
    { role: string; content: string }[]
  >([]);

  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 2;

  const [isYoutubeExplaination, setIsYoutubeExplaination] = useState(false);

  const [currentTransriptChunks, setCurrentTransriptChunks] = useState<
    { duration: number; text: string; time: number }[]
  >([]);
  const [ismOunted, setIsmOunted] = useState(false)
  // let isFirstChunk = true;

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isdarkMode, setIsdarkMode] = useState(false)


  const canvasRef = useRef<HTMLDivElement>(null);

  const [isCollaborating, setIsCollaborating] = useState(false);

  const [functionPlots, setFunctionPlots] = useState<
    {
      fn: string;
      top: string;
      left: string;
      width: number;
      height: number;
      isImage: boolean;
    }[]
  >([]);

  const elements = convertToExcalidrawElements([]);


  const library = document.querySelector(".sidebar-trigger") as HTMLElement;

  useEffect(() => {

    setIsmOunted(true)

    const client = createClient({
      authEndpoint: async (room) => {
        const response = await fetch("/api/liveblocks-auth", {
          method: "POST",
          body: JSON.stringify({ room, session }),
        });
        return await response.json();
      }
    });
    setclient(client)
    const { room, leave } = client.enterRoom(params.id, { initialPresence: { cursor: { x: 500, y: 500 }, spaceData: "" } });

    setRoom(room)
    setLeave(leave)








    if (library) {
      library.style.display = "none";
    }

    if (users.length > 0) {
      setIsCollaborating(true)

      users.map(({ connectionId, presence }) => {
        
        if (presence.spaceData) {

          const UpadtedSpaceData = JSON.parse(presence.spaceData)

          const Editor =  UpadtedSpaceData.editor;

          if(Editor.info.id !== currentUser.info.id){

            excalidrawAPI?.addFiles([
              UpadtedSpaceData.files
            ])
  
            excalidrawAPI?.updateScene({
              elements: UpadtedSpaceData.elements,
  
            });
          }

        }
      })
    }

  }, [ismOunted, library, users])




  useEffect(() => {
    const unsubscribe = room?.subscribe("others", (others: any, event: any) => {
      for (const { id, presence } of others) {
        const { x, y } = presence.cursor;
        console.log(id, x, y)
      }
    })

  }, [room])








  const handlePlotRemove = async (index: number) => {
    const plots = functionPlots.filter((plot, ind) => ind !== index);
    setFunctionPlots(plots);
  };

  const handleFunctionPlot = () => {
    if (
      activeTextElement.length === 1 &&
      (activeTextElement[0] as ExcalidrawTextElement).text
    ) {
      const text = (activeTextElement[0] as ExcalidrawTextElement).text;
      const id = (activeTextElement[0] as ExcalidrawTextElement).id;
      const { x, y } = activeTextElement[0] as ExcalidrawTextElement;

      const canvasRect = canvasRef.current?.getBoundingClientRect();

      const top = Math.round(y - (canvasRect?.top || 0) + 130).toString(); // Add some space below the text
      const left = Math.round(x - 100).toString();

      setFunctionPlots((prevPlots) => [
        ...prevPlots,
        {
          fn: text,
          top,
          left,
          width: 250,
          height: 250,
          isImage: false,
        },
      ]);

      // excalidrawAPI?.updateScene({
      //   elements: [
      //     ...excalidrawAPI.getSceneElements().filter((elem) => elem.id !== id),
      //   ],
      // });
    } else {
      toast({
        title: "Please select the function text to plot a function!",
      });
    }
  };

  const handleGenerate = async () => {
    try {
      if (activeTextElement.length > 1) {
        toast({
          title: "Auto complete is not supported for multiple elements!!",
          description: "Choose any one element",
        });
      } else if (
        activeTextElement.length === 1 &&
        (activeTextElement[0] as ExcalidrawTextElement).text
      ) {
        const id = (activeTextElement[0] as ExcalidrawTextElement).id;
        let updated_element = {
          ...(activeTextElement[0] as ExcalidrawTextElement),
          id: id,
          height: (activeTextElement[0] as ExcalidrawTextElement).height + 70,
          baseline: (activeTextElement[0] as ExcalidrawTextElement).height + 70,
          width: (activeTextElement[0] as ExcalidrawTextElement).width + 40,
          text: `${(activeTextElement[0] as ExcalidrawTextElement).text} \n\n Generating....`,
        };

        excalidrawAPI?.updateScene({
          elements: [
            ...excalidrawAPI
              .getSceneElements()
              .filter((elements) => elements.id !== id),
            updated_element,
          ],
        });

        const text = (activeTextElement[0] as ExcalidrawTextElement).text;

        const text_len = text.length - 500 > 0 ? text.length - 500 : 0;

        let message = ""

        await axios.post("http://localhost:3002/api/neura/stream", {
          model: "NeuraAiSketchPad",
          messages: [
            ...canvasPrompts,
            {
              role: "user",
              content: `${text.substring(text_len)} `,
            },
          ],
        }, {
          responseType: 'stream',
          onDownloadProgress(progressEvent) {
            const xhr = progressEvent.event.target;
            const { responseText } = xhr;

            if (responseText) {
              const chunks = responseText.split('\n').filter((chunk: string) => chunk.trim() !== '');
              let accumulated_message = "";
              let created_at = "";
              let role = "";
              let end = false

              chunks.forEach((chunk: string) => {
                const parsed = JSON.parse(chunk);
                accumulated_message += parsed.message.content;
                created_at = parsed.created_at;
                role = parsed.message.role;
                if (parsed.done) {
                  end = true;
                }


              });




              // Calculate new width and height
              const lineHeight = 25; // Adjust this value based on your font size
              const charWidth = 15; // Approximate width of a character, adjust as necessary
              const maxCharsPerLine = 50; // Adjust based on your desired line length

              const wrappedText = wrapText(`${(activeTextElement[0] as ExcalidrawTextElement).text} \n\n ${accumulated_message}`, maxCharsPerLine);
              const textLines = wrappedText.split("\n");

              const newWidth =
                Math.max(...textLines.map((line) => line.length)) * charWidth;
              const newHeight = textLines.length * lineHeight;

              updated_element = {
                ...(activeTextElement[0] as ExcalidrawTextElement),
                id: id,
                width: newWidth + 20,
                fontFamily: 3,
                height: newHeight + 20,
                baseline: newHeight + 20,
                text: wrappedText,
              };

              excalidrawAPI?.updateScene({
                elements: [
                  ...excalidrawAPI
                    .getSceneElements()
                    .filter((elements) => elements.id !== id),
                  updated_element,
                ],

                appState: excalidrawAPI.getAppState(),
              });

              message = accumulated_message







            }
          }
        }).then(() => {
          setcanvasPrompts([
            ...canvasPrompts,
            {
              role: "user",
              content: `${text.substring(text_len)}`,
            },
            {
              role: "assistant",
              content: message,
            },
          ]);
        });

        // const data = await response.data;
        // const newText = data.data.message.content;

        // setcanvasPrompts([
        //   ...canvasPrompts,
        //   {
        //     role: "user",
        //     content: `${text.substring(text_len)}`,
        //   },
        //   {
        //     role: data.data.message.role,
        //     content: data.data.message.content,
        //   },
        // ]);

        // // Calculate new width and height
        // const lineHeight = 25; // Adjust this value based on your font size
        // const charWidth = 15; // Approximate width of a character, adjust as necessary
        // const maxCharsPerLine = 50; // Adjust based on your desired line length

        // const wrappedText = wrapText(newText, maxCharsPerLine);
        // const textLines = wrappedText.split("\n");

        // const newWidth =
        //   Math.max(...textLines.map((line) => line.length)) * charWidth;
        // const newHeight = textLines.length * lineHeight;

        // updated_element = {
        //   ...(activeTextElement[0] as ExcalidrawTextElement),
        //   id: id,
        //   width: newWidth + 20,
        //   fontFamily: 3,
        //   height: newHeight + 20,
        //   baseline: newHeight + 20,
        //   text: wrappedText,
        // };

        // excalidrawAPI?.updateScene({
        //   elements: [
        //     ...excalidrawAPI
        //       .getSceneElements()
        //       .filter((elements) => elements.id !== id),
        //     updated_element,
        //   ],

        //   appState: excalidrawAPI.getAppState(),
        // });










      } else {
        toast({
          title: "Please select the text to auto complete!!",
        });
      }
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes(
          "Cannot read properties of undefined (reading 'text')",
        )
      ) {
        toast({
          title: "Please select the text to auto complete!!",
        });
      } else {
        // Handle other types of errors if necessary
        toast({
          title: "Unknown Error",
          color: "red",
        });
      }
    }
  };

  const handleAutoComplete = async () => {
    try {
      if (activeTextElement.length > 1) {
        toast({
          title: "Auto complete is not supported for multiple elements!!",
          description: "Choose any one element",
        });
      } else if (
        activeTextElement.length === 1 &&
        (activeTextElement[0] as ExcalidrawTextElement).text
      ) {
        const id = (activeTextElement[0] as ExcalidrawTextElement).id;
        let updated_element = {
          ...(activeTextElement[0] as ExcalidrawTextElement),
          id: id,
          height: (activeTextElement[0] as ExcalidrawTextElement).height + 70,
          baseline: (activeTextElement[0] as ExcalidrawTextElement).height + 70,
          fontFamily: 3,
          width: (activeTextElement[0] as ExcalidrawTextElement).width + 110,
          text: `${(activeTextElement[0] as ExcalidrawTextElement).text} \n\n Auto completing ....`,
        };

        excalidrawAPI?.updateScene({
          elements: [
            ...excalidrawAPI
              .getSceneElements()
              .filter((elements) => elements.id !== id),
            updated_element,
          ],
        });

        const text = (activeTextElement[0] as ExcalidrawTextElement).text;

        const response = await axios.post("http://localhost:3002/api/neura", {
          model: "NeuraAiSketchPad",
          messages: [
            ...canvasPrompts,
            {
              role: "user",
              content: `Complete this text. Only response with complete text including the previous text , not other string should be in your response. Don't say anything like here is a possible completion of the text.\n\n

            For example : \n

            text : apple is good for \n
            your response : apple is good for health , it has many benifits like .... \n
            
            
            \n\n given text: ${text}`,
            },
          ],
        });

        const data = await response.data;
        const newText = data.data.message.content;

        setcanvasPrompts([
          ...canvasPrompts,
          {
            role: "user",
            content: `Complete this text. Only response with complete text including the previous text , not other string should be in your response. Don't say anything like here is a possible completion of the text.\n\n

            For example : \n

            text : apple is good for \n
            your response : apple is good for health , it has many benifits like .... \n
            
            
            \n\n given text: ${text}`,
          },
          {
            role: data.data.message.role,
            content: data.data.message.content,
          },
        ]);

        console.log(newText);

        // Calculate new width and height
        const lineHeight = 25; // Adjust this value based on your font size
        const charWidth = 15; // Approximate width of a character, adjust as necessary
        const maxCharsPerLine = 30; // Adjust based on your desired line length

        const wrappedText = wrapText(newText, maxCharsPerLine);
        const textLines = wrappedText.split("\n");

        const newWidth =
          Math.max(...textLines.map((line) => line.length)) * charWidth;
        const newHeight = textLines.length * lineHeight;

        updated_element = {
          ...(activeTextElement[0] as ExcalidrawTextElement),
          id: id,
          width: newWidth + 20,
          fontFamily: 3,
          height: newHeight + 20,
          baseline: newHeight + 20,
          text: `${wrappedText}`,
        };

        console.log(updated_element);

        excalidrawAPI?.updateScene({
          elements: [
            ...excalidrawAPI
              .getSceneElements()
              .filter((elements) => elements.id !== id),
            updated_element,
          ],
          appState: excalidrawAPI.getAppState(),
        });
      } else {
        toast({
          title: "Please select the text to auto complete!!",
        });
      }
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes(
          "Cannot read properties of undefined (reading 'text')",
        )
      ) {
        toast({
          title: "Please select the text to auto complete!!",
        });
      } else {
        // Handle other types of errors if necessary
        toast({
          title: "Unknown Error",
          color: "red",
        });
      }
    }
  };

  // Helper function to wrap text
  const wrapText = (text: string, maxCharsPerLine: number) => {
    const lines = text.split("\n");
    let wrappedText = "";
    let inCodeBlock = false;
    const separatorLine = "=".repeat(maxCharsPerLine);

    lines.forEach((line) => {
      // Check if the line contains the code block delimiter
      const codeBlockIndex = line.indexOf("```");

      if (codeBlockIndex !== -1) {
        inCodeBlock = !inCodeBlock;
        if (inCodeBlock) {
          // Start of code block
          wrappedText += `${separatorLine}\n${line}\n`;
        } else {
          // End of code block
          wrappedText += `${line}\n${separatorLine}\n\n`;
        }
        return;
      }

      if (inCodeBlock) {
        wrappedText += line + "\n";
      } else {
        if (line.length > maxCharsPerLine) {
          const words = line.split(" ");
          let currentLine = "";

          words.forEach((word) => {
            if ((currentLine + word).length > maxCharsPerLine) {
              wrappedText += currentLine.trim() + "\n\n";
              currentLine = word + " ";
            } else {
              currentLine += word + " ";
            }
          });

          wrappedText += currentLine.trim() + "\n\n";
        } else {
          wrappedText += line + "\n\n";
        }
      }
    });

    return wrappedText.trim();
  };

  const handleExcalidrawChange = useCallback(() => {
    if (excalidrawAPI) {
      const canvasState = excalidrawAPI.getAppState();
      const currentElement = excalidrawAPI.getSceneElements();
      const currentFiles = excalidrawAPI.getFiles();

      setCurrentElements(currentElement);



      updateMyPresence({
        spaceData: JSON.stringify({
          Appstate: excalidrawAPI.getAppState(),
          elements: excalidrawAPI.getSceneElements(),
          files: excalidrawAPI.getFiles(),
          editor: currentUser
        })
      })



      const embeddable_elements = currentElement.filter(
        (element) => element.type === "embeddable",
      );

      const text_elements = currentElement.filter(
        (element) => element.type === "text",
      );

      const selected_elements = canvasState.selectedElementIds;

      const current_text_element = text_elements.filter((element) =>
        Object.keys(selected_elements).includes(element.id),
      );

      setActiveTextElement((prev) => {
        const prevIds = prev.map((el) => el.id);
        const newIds = current_text_element.map((el) => el.id);
        if (
          prevIds.length === newIds.length &&
          prevIds.every((id, idx) => id === newIds[idx])
        ) {
          return prev;
        }
        return current_text_element;
      });

      const current_embeddable = embeddable_elements.filter((element) =>
        Object.keys(selected_elements).includes(element.id),
      );

      setActiveEmbeddable((prev) => {
        const prevIds = prev.map((el) => el.id);
        const newIds = current_embeddable.map((el) => el.id);
        if (
          prevIds.length === newIds.length &&
          prevIds.every((id, idx) => id === newIds[idx])
        ) {
          return prev;
        }
        return current_embeddable;
      });

      if (current_embeddable[0]?.link) {
        setCurrentYoutubeLink(current_embeddable[0].link);
      }
    }
  }, [excalidrawAPI]);

  const handleYoutubeExplainer = async () => {
    try {
      if (activeEmbeddable.length > 1) {
        toast({
          title: "Please select only one embeddable element",
        });
      } else if (activeEmbeddable.length === 1 && currentYoutubeLink) {
        setIsYoutubeExplaination(true);
        const response = await axios.post(
          "http://localhost:3002/api/neura/youtube_subtitles",
          {
            link: currentYoutubeLink,
          },
        );

        const transript_chunks_data = response.data;
        const transript_chunks = transript_chunks_data.data;

        setCurrentTransriptChunks(transript_chunks);

        const additionalPrompt = {
          role: "assistant",
          content: "Okay , please provide next transcript part",
        };

        // Create the prompts array with the additional prompt interspersed
        let prompts = transript_chunks.slice(0, 4).reduce(
          (
            acc: {
              role: string;
              content: string;
            }[],
            chunk: {
              duration: number;
              text: string;
              time: number;
            },
            index: number,
          ) => {
            const formattedPrompt = {
              role: "user",
              content: `
              start time: ${formatSeconds(Math.round(chunk.time))} \n\n
              end time: ${formatSeconds(Math.round(chunk.time + chunk.duration))} \n\n
              transcript number: ${index + 1} \n\n
              transcript: ${chunk.text}`,
            };

            // Add the formatted prompt to the accumulator
            acc.push(formattedPrompt);

            // Add the additional prompt between each chunk
            if (index < transript_chunks.length - 1) {
              acc.push(additionalPrompt);
            }

            return acc;
          },
          [],
        );

        if (prompts.length > 0) {
          const elements = convertToExcalidrawElements([
            {
              type: "text",
              width: 140,
              fontFamily: 1,
              height: 80,
              baseline: 80,
              text: "Generating... 🪄",
              x: activeEmbeddable[0].x + 550,
              y: activeEmbeddable[0].y,
            },
          ]);

          excalidrawAPI?.updateScene({
            elements: [...excalidrawAPI.getSceneElements(), ...elements],
            appState: excalidrawAPI.getAppState(),
          });

          prompts.unshift({
            role: "assistant",
            content:
              "i will be given with parts of transcript chunks one by one that i have to analysis and once all the transcript chunks are given then i have to give it's detailed explaination and summary.  ",
          });

          if (prompts[prompts.length - 1].role !== "assistant") {
            prompts.push({
              role: "assistant",
              content: "Okay , please provide next transcript part",
            });
          }

          prompts.push({
            role: "user",
            content:
              "now full transcript chunks is given to you , now explain and summarise the whole transcript. Start your response like : Summary of the video ...",
          });

          const res = await axios.post("http://localhost:3002/api/neura", {
            model: "NeuraAiSketchPad",
            messages: [...prompts],
          });

          const data = await res.data;

          setcanvasPrompts([
            ...canvasPrompts,
            ...prompts,
            {
              role: data.data.message.role,
              content: data.data.message.content,
            },
          ]);

          const newText = data.data.message.content;

          const lineHeight = 25; // Adjust this value based on your font size
          const charWidth = 15; // Approximate width of a character, adjust as necessary
          const maxCharsPerLine = 30; // Adjust based on your desired line length

          const wrappedText = wrapText(newText, maxCharsPerLine);
          const textLines = wrappedText.split("\n");

          const newWidth =
            Math.max(...textLines.map((line) => line.length)) * charWidth;
          const newHeight = textLines.length * lineHeight;

          const elements_explain = convertToExcalidrawElements([
            {
              type: "text",
              width: newWidth + 20,
              fontFamily: 3,
              height: newHeight + 20,
              baseline: 18,
              text: wrappedText,
              x: activeEmbeddable[0].x + 550,
              y: activeEmbeddable[0].y,
            },
          ]);

          excalidrawAPI?.updateScene({
            elements: [
              ...excalidrawAPI
                .getSceneElements()
                .filter((el) => el.id !== elements[0].id),
              ...elements_explain,
            ],
          });
        } else {
          toast({
            title: "The given video doesn't support subtitles",
          });
        }
      } else {
        toast({
          title:
            "Please select an embeddable element and provide a youtube link",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error occurred while processing the request",
      });
    }
  };

  const handleScroll = (scrollX: number, scrollY: number) => {
    const fns = functionPlots.map((plot) => plot.fn);

    const textElements = (
      excalidrawAPI?.getSceneElements() as ExcalidrawTextElement[]
    ).filter((element: ExcalidrawTextElement) => fns.includes(element.text));

    textElements.map((textElement: ExcalidrawTextElement) => {
      const text = (textElement as ExcalidrawTextElement).text;
      const { x, y } = textElement as ExcalidrawTextElement;

      const canvasRect = canvasRef.current?.getBoundingClientRect();

      const top = Math.round(
        y + scrollY - (canvasRect?.top || 0) + 130,
      ).toString(); // Add some space below the text
      const left = Math.round(x + scrollX - 100).toString();

      const prevPLots = functionPlots.filter((plots) => plots.fn !== text);

      setFunctionPlots([
        ...prevPLots,
        {
          fn: text,
          top,
          left,
          width: functionPlots.filter((el) => el.fn === text)[0].width,
          height: functionPlots.filter((el) => el.fn === text)[0].height,
          isImage: false,
        },
      ]);
    });
  };

  const handledimensionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: string,
  ) => {
    const fnPlot = functionPlots.filter((el, i) => i === index)[0];

    if (type === "width") {
      fnPlot.width = Math.round(parseInt(event.target.value));

      setFunctionPlots([
        ...functionPlots.filter((el, i) => i !== index),
        fnPlot,
      ]);
    } else {
      fnPlot.height = Math.round(parseInt(event.target.value));

      setFunctionPlots([
        ...functionPlots.filter((el, i) => i !== index),
        fnPlot,
      ]);
    }
  };

  const handleImageDownload = (id: string) => {
    convertDownLoadReactComponentToImage({
      elementId: id,
      imageName: id,
      isDownload: true,
      setInitialData: setInitialData,
      excalidrawAPI: excalidrawAPI,
    });
  };

  const handlePlotToImage = (
    id: string,
    x: string,
    y: string,
    width: number,
    height: number,
  ) => {
    convertDownLoadReactComponentToImage({
      elementId: id,
      imageName: id,
      isDownload: false,
      setInitialData: setInitialData,
      excalidrawAPI: excalidrawAPI,
      values: {
        x,
        y,
        width,
        height,
      },
    });
  };

  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.onChange(handleExcalidrawChange);
    }
  }, [excalidrawAPI, handleExcalidrawChange]);

  useEffect(() => {
    setInitialData({
      elements,
      appState: { zenModeEnabled: false },
    });
  }, []);


  // useEffect(() => {
  //   console.log(presence);
  // }, [presence])
  const COLORS = [
    "#E57373",
    "#9575CD",
    "#4FC3F7",
    "#81C784",
    "#FFF176",
    "#FF8A65",
    "#F06292",
    "#7986CB",
  ];





  if (!ismOunted) {
    return (
      <div className="fixed inset-0 m-auto z-100  bg-white w-full h-full flex  flex-col space-y-3 flex-1 items-center justify-center text-black">
        <Loader2 />
        <div className="flex">
          Loading
        </div>
      </div>
    )
  }

  return (


    <div
      className={` h-full  ${isFullscreen ? 'fixed inset-0 m-auto z-120 w-full' : ' '} z-120  rounded-[10px] bg-transparent `}
      ref={canvasRef}

      onPointerMove={(event) => {
        // Update the user cursor position on every pointer move


        updateMyPresence({
          cursor: {
            x: Math.round(event.clientX),
            y: Math.round(event.clientY),
          },
        });

        // console.log(Math.round(event.clientX),
        //   Math.round(event.clientY))
      }}
      onPointerLeave={() =>
        // When the pointer goes out, set cursor to null
        updateMyPresence({
          cursor: null,
        })
      }
    >

      {

        users.map(({ connectionId, presence }) => {
          if (presence.cursor === null) {
            return null;
          }

          return (
            <Cursor
              key={`cursor-${connectionId}`}
              color={COLORS[connectionId % COLORS.length]}
              x={presence.cursor.x}
              y={presence.cursor.y}
            />
          );
        })
      }


      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        theme={isdarkMode ? "dark" : "light"}
        initialData={initialData}
        onScrollChange={handleScroll}
        renderTopRightUI={() => (
          <div className="flex items-center justify-center space-x-3">


            <LiveCollaborationTrigger
              isCollaborating={isCollaborating}
              onSelect={() => {
                console.log("opened")
                onOpen("CollaborateModal", {
                  data: {
                    user: {
                      email: session?.user?.email,
                      id: (session?.user as {
                        name?: string | null,
                        email?: string | null,
                        image?: string | null,
                        id: string
                      })?.id
                    },
                    room: {
                      roomId: params.id,
                      usersInRoom: [...users.map((u) => u.id), (session?.user as {
                        name?: string | null,
                        email?: string | null,
                        image?: string | null,
                        id: string
                      })?.id]
                    }
                  }
                })
              }}
            />


            <div className="flex pl-3">
              {users.slice(0, 2).map(({ info }, index) => {

                return (

                  <div key={index} id={info.email.toString()} className={`bg-blue-400 my-1 ml-[-14px] p-2 w-9 h-9 flex items-center justify-center
                   rounded-full border-2`}> {info.name.split(" ").map((name) => name.substring(0, 1)).join("")}</div>

                );
              })}

              {hasMoreUsers && <div className="rounded-full border-2 p-2 w-10 h-10 font-bold flex items-center justify-center ">+{users.length - 2}</div>}

              {currentUser && (

                <div id={currentUser.id.toString()} className={`bg-blue-600 my-1 ml-[-14px] p-2 w-9 h-9 flex items-center justify-center
                rounded-full border-2`}> {currentUser.info.name.split(" ").map((name) => name.substring(0, 1)).join("")}</div>

              )}
            </div>
          </div>
        )}

      >




        <WelcomeScreen>
          <WelcomeScreen.Hints.ToolbarHint >
            <p> 1. Write any text & get the response from Ai. </p>
            <p>2. Youtube video Ai explanations </p>
            <p>
              {" "}
              & many more
              {/* 3. Mathematical Graphs are only for <br /> visualization purposes
                  ,i.e cannot be exported. */}
            </p>
          </WelcomeScreen.Hints.ToolbarHint>
          <WelcomeScreen.Hints.MenuHint />
          <WelcomeScreen.Hints.HelpHint />
          <WelcomeScreen.Center >


            <WelcomeScreen.Center.Logo>
              {isdarkMode ? <Image src={"/scribIQ_white.png"} alt="logo" className="z-140" height={300} width={300} /> : (

                <Image src={"/scribIQ.png"} alt="logo" height={300} width={300} />
              )}

            </WelcomeScreen.Center.Logo>
            <WelcomeScreen.Center.Heading>
              Workspaces. Made. Smarter.
            </WelcomeScreen.Center.Heading>
          </WelcomeScreen.Center>
        </WelcomeScreen>

        <MainMenu>
          {/* <MainMenu.DefaultItems.LoadScene/> */}
          {/* <MainMenu.DefaultItems.SaveToActiveFile/> */}
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          {/* <MainMenu.DefaultItems.LiveCollaborationTrigger/> */}

        </MainMenu>




        {functionPlots.map((plot, index) => (
          <Draggable key={index}>
            <div
              style={{
                position: "absolute",
                zIndex: 10,
                top: `${plot.top}px`,
                left: `${plot.left}px`,
                width: `${plot.width + 40}px`,
                height: `${plot.height + 200}px`,
              }}
              className={` flex h-fit w-fit flex-col space-y-1 border-2 p-4`}
            >
              <div className="flex  w-full cursor-pointer items-center  justify-between p-2 ">
                <Trash2 color="red" onClick={() => handlePlotRemove(index)} />
                <Button
                  className="font-bold"
                  onClick={() => handleImageDownload(`functionPlot_${index}`)}
                >
                  Download Graph
                </Button>
              </div>
              <FunctionGraph
                width={plot.width}
                height={plot.height}
                fn={plot.fn}
                id={`functionPlot_${index}`}
              />
              <div className="flex w-fit items-center justify-center px-2 font-bold">
                <Input
                  type="text"
                  placeholder="width"
                  className="max-w-[110px]"
                  onChange={(event) =>
                    handledimensionChange(event, index, "width")
                  }
                />
                &nbsp; X &nbsp;
                <Input
                  type="text"
                  placeholder="height"
                  className={`max-w-[110px]`}
                  onChange={(event) =>
                    handledimensionChange(event, index, "height")
                  }
                />
                <Button
                  onClick={() =>
                    handlePlotToImage(
                      `functionPlot_${index}`,
                      plot.left,
                      plot.top,
                      plot.width,
                      plot.height,
                    )
                  }
                  className="mx-1 p-1 font-bold"
                >
                  Convert to Image
                </Button>
              </div>
            </div>
          </Draggable>
        ))}



        <Footer>

          {/* <div onClick={() => setIsFullscreen((prev) => !prev)} className={`mx-2 cursor-pointer flex rounded-[10px] items-center justify-center ${isdarkMode ? 'bg-[#232329]' : 'bg-[#ECECF4]'}`}>
            {isFullscreen ? <Minimize size={22} className={` h-7 w-10 p-1  ${isdarkMode ? 'text-white' : 'text-black'} `} /> : <Expand size={22} className={` h-7 w-10 p-1  ${isdarkMode ? 'text-white' : 'text-black'} `} />}
          </div> */}
          <div onClick={() => setIsdarkMode((prev) => !prev)} className={`mx-2 cursor-pointer flex rounded-[10px] items-center justify-center ${isdarkMode ? 'bg-[#232329]' : 'bg-[#ECECF4]'}  `}>
            {isdarkMode ? <Moon size={22} className={` h-7 w-10 p-1  ${isdarkMode ? 'text-white' : 'text-black'} `} /> : <Sun size={22} className={` h-7 w-10 p-1  ${isdarkMode ? 'text-white' : 'text-black'} `} />}
          </div>
          <Button onClick={handleGenerate} className="mx-2">
            <Wand size={24} className="mr-2 h-4 w-4" />
            <span className="font-bold">Generate</span>
          </Button>

          <Button
            onClick={handleYoutubeExplainer}
            className="mx-2 hidden lg:flex"
          >
            <WandSparkles size={23} className="mr-2 h-4 w-4" />
            <span className="font-bold">Summarise Youtube Video </span>
          </Button>

          <Button onClick={handleAutoComplete} className="mx-2 hidden lg:flex">
            <NotebookPen size={23} className="mr-2 h-4 w-4" />
            <span className="font-bold">Auto Complete</span>
          </Button>

          <Button onClick={handleFunctionPlot} className="mx-2 hidden lg:flex">
            <AreaChart size={23} className="mr-2 h-4 w-4" />
            <span className="font-bold">Generate Function Plot</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="mx-2 flex border-2 bg-transparent bg-white px-2 py-0 text-sm font-bold  text-black lg:hidden">
                More Ai <Sparkles size={24} className="px-1 py-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={handleYoutubeExplainer}>
                <WandSparkles className="mr-2 h-4 w-4" />
                <span>Summarise Youtube Video</span>
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleAutoComplete}>
                  <NotebookPen className="mr-2 h-4 w-4" />
                  <span>Auto Complete</span>
                  <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleFunctionPlot}>
                  <AreaChart className="mr-2 h-4 w-4" />
                  <span>Generate Function Plot</span>
                  <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* {isYoutubeExplaination && (
            <Button
              disabled={isYoutubeGenerating}
              onClick={handleContinueExplaination}
              className="mx-2 border-2 bg-transparent bg-white px-2 py-0  text-sm font-bold text-black"
            >
              {isYoutubeGenerating ? (
                <>
                  <WandSparkles size={21} className="px-1 py-0 font-bold" />{" "}
                  Generating...{" "}
                </>
              ) : (
                <>
                  Continue Explaination{" "}
                  <StepForward size={21} className="px-1 py-0 font-bold" />
                </>
              )}
            </Button>
          )} */}
        </Footer>
      </Excalidraw>
    </div>

  );
};

export default Canvas;
