#!/usr/bin/env node
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { $ } from "execa";

(async () => {
  // If running the web server then migrate existing database
  if (
    process.argv.slice(2).join(" ") === "npm run start" &&
    process.env.FLY_REGION == process.env.PRIMARY_REGION
  ) {
    console.log("setting up swapfile...");
    await $`fallocate -l 512M /swapfile`;
    await $`chmod 0600 /swapfile`;
    await $`mkswap /swapfile`;
    await writeFile("/proc/sys/vm/swappiness", "10");
    await $`swapon /swapfile`;
    await writeFile("/proc/sys/vm/overcommit_memory", "1");
    console.log("swapfile setup complete");

    await exec("npx prisma migrate deploy");
  }

  // launch application
  await exec(process.argv.slice(2).join(" "));
})();

function exec(command) {
  const child = spawn(command, { shell: true, stdio: "inherit" });
  return new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}
