import { exec as nodeExec } from "child_process";

type Param = {
  basePath: string;
};
export const exec = async (after: string, { basePath }: Param) => {
  await new Promise((resolve, reject) =>
    nodeExec(after, { cwd: basePath }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        console.log(stdout);
        console.error(stderr);
        resolve(stdout);
      }
    })
  );
};
