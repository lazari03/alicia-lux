const url=process.argv[2]
for(let attempt=0;attempt<90;attempt++){
  try{const response=await fetch(url,{signal:AbortSignal.timeout(5000)});if(response.ok)process.exit(0)}catch{}
  await new Promise(resolve=>setTimeout(resolve,2000))
}
console.error(`Service did not become ready: ${url}. Run make logs.`)
process.exit(1)
