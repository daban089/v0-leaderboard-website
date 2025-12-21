# How to Compile the Plugin

## Prerequisites

You need to have these installed:
- **Java JDK 8 or higher** - [Download here](https://adoptium.net/)
- **Maven** - [Download here](https://maven.apache.org/download.cgi)

## Step-by-Step Compilation

### 1. Verify Java and Maven Installation

Open your terminal/command prompt and run:

\`\`\`bash
java -version
mvn -version
\`\`\`

Both should show version information.

### 2. Navigate to Plugin Directory

\`\`\`bash
cd minecraft-plugin
\`\`\`

### 3. Compile the Plugin

\`\`\`bash
mvn clean package
\`\`\`

This will:
- Download required dependencies (Spigot API)
- Compile the Java code
- Package everything into a JAR file

### 4. Locate the Compiled JAR

After successful compilation, find your plugin at:
\`\`\`
minecraft-plugin/target/smp-stats-1.0.jar
\`\`\`

### 5. Deploy to Server

Upload `smp-stats-1.0.jar` to your server's `plugins` folder and restart.

## Troubleshooting

**"mvn: command not found"**
- Maven is not installed or not in your PATH
- Install Maven and add it to your system PATH

**"JAVA_HOME is not set"**
- Set your JAVA_HOME environment variable to your JDK installation path

**Build fails with dependency errors**
- Check your internet connection (Maven needs to download dependencies)
- Try running `mvn clean` first, then `mvn package`

## Quick Recompile After Changes

If you make code changes:

\`\`\`bash
mvn clean package
\`\`\`

Then replace the old JAR in your server's plugins folder and restart.
