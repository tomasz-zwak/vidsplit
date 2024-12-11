import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import routeStaticFilesFrom from "./util/routeStaticFilesFrom.ts";

export const app = new Application();
const router = new Router();

router.post("/upload", async (context) => {
  const upload = await context.request.body.formData();

  const video = upload.get("file") as File;

  const uuid = crypto.randomUUID();

  const videoPath = `./uploads/${uuid}_${video.name}`;
  const audioPath = `./uploads/${uuid}_${video.name.replace(/mp4$/, "mp3")}`;

  Deno.writeFileSync(videoPath, new Uint8Array(await video.arrayBuffer()));

  const command = new Deno.Command("ffmpeg", {
    args: [
      "-i",
      videoPath,
      "-vn",
      "-acodec",
      "libmp3lame",
      audioPath,
    ],
  });

  const cmd = command.outputSync();

  if (!cmd.success) throw new Error("command fail");

  const audio = Deno.readFileSync(audioPath);

  context.response.body = audio;

  Deno.removeSync(videoPath);
  Deno.removeSync(audioPath);
});

app.use(router.routes());
app.use(routeStaticFilesFrom([
  `${Deno.cwd()}/client/dist`,
  `${Deno.cwd()}/client/public`,
]));

if (import.meta.main) {
  console.log("Server listening on port http://localhost:8000");
  await app.listen({ port: 8000 });
}
