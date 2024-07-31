"use client";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import styles from "./page.module.scss";
import React, { useState, useRef, useEffect } from "react";
import Chart from "@/components/molecules/Chart";
import Search from "@/components/organisms/Search";
import APIKey from "@/components/organisms/APIKey";
import Ad from "@/components/atoms/Ad";
import Logs from "@/components/organisms/Logs";
import { prompt } from "@/libs/prompt";
import { Toaster, toast } from "sonner";
import Spinner from "@/components/atoms/Spinner";
import { data, DataIT } from "@/json/data";
import { extractJSON } from "@/libs/extractJSON";

export default function Home() {
  const textAreaRef = useRef<any>(null);
  const [spinner, setSpinner] = useState(true);
  const [apiKey, setApiKey] = useState("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");
  const [modelInput, setModelInput] = useState("llama-3-sonar-small-32k-chat");
  const [search, setSearch] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [response, setResponse] = useState("");

  // Configuración del proveedor de OpenAI con la clave de API
  const openaiProvider = createOpenAI({
    apiKey: apiKey,
    baseURL: "https://api.perplexity.ai",
    compatibility: "compatible", // Modo estricto para usar la API de OpenAI
  });

  const fetchStreamingText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = data[indexDate].slice(0, 40);

    if (apiKey.length === 0) {
      toast("Debes introducir tu Perplexity API Key");
      window.scrollTo(0, 0);
      return;
    }
    setIsStreaming(true);
    try {
      const model = openaiProvider.chat(modelInput);
      const { textStream } = await streamText({
        model: model,
        prompt: prompt(values),
      });
      let accumulatedText = "";
      for await (const textPart of textStream) {
        accumulatedText += textPart;
        setResponse(accumulatedText);
        // Scroll to the bottom to show the latest text
        if (textAreaRef.current) {
          textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
        }
      }
    } catch (error) {
      toast("Error solicitando los datos.");
    } finally {
      setIsStreaming(false);
      setIndexSlice(80);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSpinner(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // !TEST
  //   interface currentDataIT {
  //     timestamp: string;
  //     close: number;
  //     prediction: number;
  //   }
  //   [];

  const [indexDate, setIndexDate] = useState("2024-07-17");
  const [currentData, setCurrentData] = useState<any>([]);
  const [indexSlice, setIndexSlice] = useState(40);
  useEffect(() => {
    setCurrentData(
      data[indexDate].map((i) => {
        i.prediction = i.close;
        return i;
      })
    );
  }, [indexDate]);

  useEffect(() => {
    if (!isStreaming) {
      const parsedData = extractJSON(response);
      setCurrentData(
        data[indexDate].map((i: any) => {
          const item = parsedData.find((f: any) => f.timestamp === i.timestamp);
          console.log(item);

          if (i.timestamp === item?.timestamp) {
            i.prediction = item.close;
          }
          return i;
        })
      );
      //       console.log(
      //         data[indexDate].map((i: any) => {
      //           const item = parsedData.find((f: any) => f.timestamp === i.timestamp);
      //           if (i.timestamp === item?.timestamp) {
      //             i.prediction = item.closed;
      //           }
      //           return i;
      //         })
      //       );
    }
  }, [isStreaming, response, indexDate]);

  return (
    <div className={styles.main}>
      <APIKey apiKey={apiKey} setApiKey={setApiKey} modelInput={modelInput} setModelInput={setModelInput} />
      <Search
        data={data}
        indexDate={indexDate}
        setIndexDate={setIndexDate}
        setIndexSlice={setIndexSlice}
        search={search}
        setSearch={setSearch}
        fetchStreamingText={fetchStreamingText}
        setIsStreaming={setIsStreaming}
      />
      <Chart
        currentData={currentData.slice(0, indexSlice)}
        indexDate={indexDate}
        response={response}
        isStreaming={isStreaming}
      />
      <Logs response={response} textAreaRef={textAreaRef} />
      <Ad />
      <Toaster style={{ fontFamily: "var(--motiva400)" }} />
      {spinner && (
        <div className={styles.loader}>
          <Spinner />
        </div>
      )}
    </div>
  );
}
