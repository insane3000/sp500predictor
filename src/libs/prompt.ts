export const prompt = (values: any) => {
  return `
  Basado en los datos históricos del siguiente JSON ${JSON.stringify(
    values
  )}, realiza un análisis técnico para predecir los próximos 8 valores de cierre. El análisis debe considerar tendencias, patrones y cualquier indicador relevante que puedas identificar. Devuélveme los resultados en objetos dentro de un array en el siguiente formato JSON:
[
    {
        "timestamp": "12:50:00",
        "close": 0
    },
    {
        "timestamp": "12:55:00",
        "close": 0
    }
    // ... agrega los 6 objetos resultantes
]
Asegúrate de que el JSON resultante esté bien formateado y que los timestamps sean consistentes en intervalos de 5 minutos. Si no se puede predecir un valor, usa null para el campo "close". 
`;
};
