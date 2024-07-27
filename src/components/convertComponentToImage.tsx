"use client";
import {
  ExcalidrawImageElement,
  FileId,
} from "@excalidraw/excalidraw/types/element/types";
import {
  DataURL,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import html2canvas from "html2canvas";
import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";

interface ConvertToImageOptions {
  elementId: string;
  imageName: string;
  excalidrawAPI: ExcalidrawImperativeAPI | undefined;
  imageType?: "png" | "jpeg";
  quality?: number; // Only applicable for 'jpeg'
  isDownload: boolean;
  values?: { x: string; y: string; width: number; height: number };
  setInitialData: Dispatch<
    SetStateAction<ExcalidrawInitialDataState | undefined>
  >;
}

export const convertDownLoadReactComponentToImage = async ({
  elementId,
  excalidrawAPI,
  imageName,
  imageType = "png",
  quality = 1.0,
  isDownload,
  values,
  setInitialData,
}: ConvertToImageOptions): Promise<void> => {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const canvas = await html2canvas(element);
  const dataURL = canvas.toDataURL(`image/${imageType}`, quality);

  if (isDownload) {
    downloadReactComponentAsImage(dataURL, imageName, imageType);
  } else {
    const fileId = elementId as FileId;

    if (values) {
      const imageElement: ExcalidrawImageElement = {
        // image attributes
        // ------------------
        type: "image",
        id: elementId,
        status: "saved",
        fileId,
        // generic attributes
        // ------------------
        version: 2,
        versionNonce: Date.now(),
        x: parseInt(values.x),
        y: parseInt(values.y),
        width: values.width,
        height: values.height,
        scale: [1, 1],
        isDeleted: false,
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        groupIds: [],
        strokeColor: "#000000",
        backgroundColor: "transparent",
        seed: Date.now(),
        roundness: null,
        angle: 0,
        frameId: null,
        boundElements: null,
        updated: Date.now(),
        locked: false,
        link: null,
      };

      excalidrawAPI?.addFiles([
        {
          mimeType: `image/${imageType}`,
          id: fileId,
          dataURL: dataURL as DataURL,
          created: Date.now(),
        },
      ]);

      excalidrawAPI?.updateScene({
        elements: [...excalidrawAPI.getSceneElements(), imageElement],
        appState: excalidrawAPI.getAppState(),
      });
    }
  }
};

export const downloadReactComponentAsImage = async (
  dataURL: string,
  imageName: string,
  imageType: string,
) => {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = `${imageName}.${imageType}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
