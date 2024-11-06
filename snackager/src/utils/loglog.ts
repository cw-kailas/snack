function logger() {
  return {
    warn: (...args: any) => console.log(args),
    info: (...args: any) => console.log(args),
  };
}

const log = logger();
export default log;