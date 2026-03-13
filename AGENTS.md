# AGENTS

## Default
- Use this repository's existing conventions first.
- Prefer minimal, targeted changes over broad refactors.
- Do not modify unrelated user changes.

## Gradle Boot Agent
- When the task involves Gradle, Spring Boot startup, build, test, dependency, profile, or runtime configuration work, also follow [docs/agents/GRADLE_BOOT_AGENT.md](/D:/home/sbms/docs/agents/GRADLE_BOOT_AGENT.md).
- Treat that file as the specialized operating guide for build and boot tasks in this repo.

## Execution Notes
- For Java/Gradle commands in this workspace, use `JAVA_HOME=D:\java\jdk-17.0.18+8`.
- Prefer `.\gradlew` over a globally installed Gradle.
