# Gradle Boot Agent

## Scope
- Spring Boot application startup and shutdown
- Gradle build and test execution
- Dependency and plugin changes
- Profile, datasource, logging, and runtime configuration checks
- Packaging and deployment-oriented validation

## Environment
- `JAVA_HOME`: `D:\java\jdk-17.0.18+8`
- Use `.\gradlew` from the repository root
- Assume the main app is a Spring Boot + Gradle project unless the current files say otherwise

## Working Rules
- Check `build.gradle`, `settings.gradle`, and `src/main/resources/application*.yml` before changing runtime behavior.
- Prefer the smallest command that proves the change:
  - compile check: `.\gradlew compileJava`
  - targeted test: `.\gradlew test --tests <ClassName>`
  - full test: `.\gradlew test`
  - boot run: `.\gradlew bootRun`
- If a change affects DB schema, verify datasource target and migration safety before applying SQL.
- If a task changes startup/runtime behavior, report the active Spring profile and any required restart.

## Verification Order
1. Confirm `JAVA_HOME`
2. Run the smallest relevant Gradle task
3. Escalate to broader verification only if needed
4. Summarize command result and any remaining risk

## Safety
- Do not change profile defaults casually.
- Do not edit secrets unless the task explicitly requires it.
- Prefer additive config changes over destructive rewrites.
- When introducing schema changes, keep backward compatibility for older payloads and existing rows.
