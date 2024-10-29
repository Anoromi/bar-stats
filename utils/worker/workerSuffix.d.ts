

declare module '*?worker' {
  const workerConstructor: {
    new(): Worker
  }
  export default workerConstructor
}

declare module '*?url' {
  const workerUrl: string
  export default workerUrl
}
