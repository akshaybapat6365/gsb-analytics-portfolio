#!/usr/bin/env node

const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);

if (major !== 20) {
  console.error(
    `Environment check failed: Node ${process.versions.node} detected. Use Node 20.x for this repo.`,
  );
  process.exit(1);
}

console.log(`Environment check passed: Node ${process.versions.node}`);
