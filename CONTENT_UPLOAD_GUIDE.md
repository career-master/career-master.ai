# Content Upload Guide - Topics & Cheatsheets

This guide explains how to use GPT to generate content and upload it to your website using **Markdown format** (easiest method).

## Quick Start

### Step 1: Get the GPT Prompt
Open `GPT_CONTENT_GENERATION_PROMPT.md` and copy the entire prompt (from "PROMPT START" to "PROMPT END").

### Step 2: Generate Content with GPT
1. Paste the prompt into ChatGPT or any GPT-based AI
2. Provide your subject and topics, for example:
   ```
   Generate cheatsheet content in Markdown format for "JavaScript Fundamentals" with these topics:
   1. Introduction to JavaScript
   2. Variables and Data Types
   3. Functions
   4. Objects and Arrays
   5. DOM Manipulation
   ```
3. GPT will generate **Markdown content** (much easier than JSON!)

### Step 3: Upload to Your Website

You have **three easy options**:

#### Option A: Paste & Auto-Format (EASIEST - Recommended) ⭐

1. Go to `/admin/subjects/new` in your website
2. Select or create your subject
3. For each topic:
   - Click "Add Topic" and fill in:
     - **Title**: Copy from GPT output (after `## TOPIC:`)
     - **Description**: Copy from GPT output (after `**Description:**`)
     - **Order**: Sequential number (0, 1, 2, 3...)
   - Save the topic
   - In the cheatsheet section, click **"📋 Paste & Auto-Format"** button
   - Paste the Markdown content from GPT (the content after the description)
   - The system will auto-format headings and code blocks!
   - Save the cheatsheet

**This is the easiest method** - just copy and paste!

#### Option B: Upload .md File

1. Copy the Markdown content from GPT for each topic
2. Save each topic's content as a separate `.md` file (e.g., `topic1.md`, `topic2.md`)
3. Go to `/admin/subjects/new`
4. Create the topic first (title, description, order)
5. Click **"📄 Upload .md"** button
6. Select the `.md` file
7. Content will be loaded automatically!

#### Option C: Upload HTML File

1. If GPT generates HTML instead of Markdown, save it as `.html` file
2. Go to `/admin/subjects/new`
3. Create the topic first
4. Click **"🌐 Upload HTML"** button
5. Select the `.html` file
6. The system will automatically convert HTML to Markdown!

## Markdown Format Expected

The GPT should generate content in **Markdown format** like this:

```markdown
## TOPIC: Introduction to JavaScript
**Description:** Learn the basics of JavaScript programming language, its history, and how to write your first JavaScript code.

---

### Introduction to JavaScript

JavaScript is a high-level, interpreted programming language...

#### Key Concepts
- Dynamic typing
- Event-driven programming
- Prototype-based inheritance

#### Your First Code

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

#### Additional Resources
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## TOPIC: Variables and Data Types
**Description:** Understanding how to declare variables and work with different data types.

[Content continues...]
```

## Field Specifications

### Topic Fields (to fill in admin panel):
- **title**: Required, max 200 characters (copy from `## TOPIC:` line)
- **description**: Optional, max 1000 characters (copy from `**Description:**` line)
- **order**: Number, sequential (0, 1, 2, 3...)
- **prerequisites**: Usually leave empty for new topics
- **requiredQuizzesToUnlock**: Default is 2
- **isActive**: Default is true

### Cheatsheet Content:
- **Format**: Markdown (preferred) or HTML
- **Content**: Everything after the description line
- The system automatically:
  - Detects and formats headings
  - Formats code blocks with syntax highlighting
  - Converts HTML to Markdown if needed

## Tips for Best Results

1. **Use Markdown Format**: It's easier for GPT to generate and for you to read/edit
2. **Use "Paste & Auto-Format"**: This is the easiest method - just copy and paste!
3. **Be Specific with GPT**: Provide clear topic names and any specific requirements
4. **Review Generated Content**: Check the Markdown formatting before uploading
5. **Test with One Topic First**: Upload one topic to verify everything works
6. **The System Auto-Formats**: Headings and code blocks are automatically detected and formatted

## Troubleshooting

### "Invalid subjectId format"
- Make sure the subject ID is a valid MongoDB ObjectId (24 hex characters)
- Find the correct ID from your database or admin panel

### "Invalid userId format"
- Make sure the user ID is a valid MongoDB ObjectId
- Use your admin user's ID

### "Topic title is required"
- Check that all topics have a `title` field in the JSON
- Ensure titles are under 200 characters

### "Content is required" (for cheatsheet)
- Make sure each topic has a `cheatsheet.content` field
- The content should be a string (HTML)

### Database Connection Issues
- Check your `.env` file has the correct `MONGODB_URI`
- Ensure MongoDB is running and accessible

## Example Workflow

1. **Subject**: "Python Programming"
2. **Request to GPT**:
   ```
   Generate cheatsheet content in Markdown format for "Python Programming" with:
   1. Introduction to Python
   2. Variables and Data Types
   3. Control Flow
   4. Functions
   5. Lists and Dictionaries
   ```
3. **GPT generates Markdown content** (not JSON!)
4. **Go to Admin Panel**: `/admin/subjects/new`
5. **For each topic**:
   - Create topic: Copy title and description from GPT output
   - Click "📋 Paste & Auto-Format"
   - Paste the Markdown content
   - Save!
6. **Done!** All topics and cheatsheets are now on your website

**That's it!** No scripts, no JSON parsing - just copy and paste! 🎉

## Need Help?

- Check the GPT prompt file for detailed instructions
- Review the script file for technical details
- Check your database connection and credentials
- Verify all IDs are correct MongoDB ObjectIds

