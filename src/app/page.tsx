"use client";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import styles from "./page.module.scss";
import React, { useState, useRef, useEffect } from "react";
import Chart from "@/components/organisms/Chart";
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
  const [apiKey, setApiKey] = useState("");
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
    const historicalData = data[date].slice(0, 40);

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
        prompt: prompt(historicalData, quantity),
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
      setIndexSlice(40 + quantity);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSpinner(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // !PROCESSING
  const [date, setDate] = useState("2024-07-17");
  const [currentData, setCurrentData] = useState<any>([]);
  const [indexSlice, setIndexSlice] = useState(40);
  const [quantity, setQuantity] = useState(6);

  const handleCurrentDate = () => {
    setCurrentData(
      data[date].map((i) => {
        i.prediction = i.close;
        return i;
      })
    );
  };
  useEffect(() => {
    handleCurrentDate();
  }, [date]);

  useEffect(() => {
    if (!isStreaming) {
      const parsedData = extractJSON(response);
      setCurrentData(
        data[date].map((i: any) => {
          const item = parsedData.find((f: any) => f.timestamp === i.timestamp);
          if (i.timestamp === item?.timestamp) i.prediction = item.close;
          return i;
        })
      );
    }
  }, [isStreaming, response, date]);

  return (
    <div className={styles.main}>
      <APIKey apiKey={apiKey} setApiKey={setApiKey} modelInput={modelInput} setModelInput={setModelInput} />
      <Search
        data={data}
        date={date}
        setDate={setDate}
        setIndexSlice={setIndexSlice}
        search={search}
        setSearch={setSearch}
        fetchStreamingText={fetchStreamingText}
        setIsStreaming={setIsStreaming}
        quantity={quantity}
        setQuantity={setQuantity}
        handleCurrentDate={handleCurrentDate}
      />
      <Chart currentData={currentData.slice(0, indexSlice)} isStreaming={isStreaming} />
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
