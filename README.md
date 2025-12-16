# RenderStack

RenderStack brings modern media embedding to FakeStackOverflow, most notably through a native 3D model viewport that lets users upload, view, and interact with 3D assets directly in the browser. It also introduces a community-driven gallery for showcasing work, along with expanded profile customization that allows users to build dynamic, portfolio-style pages. Together, these features elevate the platform from a traditional Q&A site into a collaborative hub for creative problem-solving, inspiration, and professional expression in software development, graphics, and 3D art.

View RenderStack here: https://cs4530-f25-201.onrender.com/home

## Localhost Setup

1. Set up MongoDB and Auth0, and ensure correct environment variable setup in .env files
2. Run `npm install` in the root directory to install all dependencies for the `client`, `server`, and `shared` folders
3. In the server directory, execute `npm run delete-db`, followed by `npm run populate-db`
4. Localhost should be running at http://localhost:4530/ 

## Feature Overview

### 3D Viewport

The 3D Viewport supports GLB file uploads, enabling users to explore models directly through mouse-driven orbit controls (panning, tilting, rotating, zooming). This allows users to freely rotate and inspect 3D assets in detail within the browser.

### Questions

The New Question Form has expanded to include media uploads (YouTube/Vimeo links, image, video, and GLB). Drag-and-drop is also included for seamless uploading. Only one file is allowed per question post. If users upload a 3D model, they have the option to allow others to download their model file from the question post.

The New Question form also supports adding camera references. This can be done by interacting with the 3D model via orbit controls and then clicking “Add Camera Reference” to append the reference to the question detail. The camera reference appears as a clickable link once the question is posted. When clicked, the viewport scene and camera snap to the correct position.

### Answers

Answers also support camera references. The 3D model media in question can be interacted with via orbit controls and when “Answer Question” is clicked, an option to “Add Camera Reference” appears. 

### Comments

Under question posts, users can similarly leave comments with embedded media with drag-and-drop support. Similar to questions, if users choose to upload a 3D model file, they can choose whether or not to give permission to other users to download their model. For posters of question posts and comments that contain model files, they will see a button by their post that allows them to toggle download permissions on said file even after they post.

### Community Gallery

The community gallery is an added feature of the community page, displaying projects with media content uploaded by users of that community. 

### User Profiles

RenderStack’s enhanced user profile system improves basic user accounts into comprehensive professional portfolios. With the improved user profile functionality, users can better share their work, showcase their skills, and show off their artistic identity. 

## Database Architecture

The schemas for the database are documented in the directory `server/models/schema`.
A class diagram for the schema definition is shown below:

![Class Diagram](class-diagram.png)

> [!NOTE]
> Due to contraints around third party databases such as AWS requiring payment, files on Render are stored ephemerally and only lasts per session. Please keep this in mind when testing on Render!

### ENV Files

Please ensure you have these exact .env file setups in each of the following directories:

### `/server`
AUTH0_ISSUER_BASE_URL="dev-yipqv2u1k7drpppn.us.auth0.com"  
AUTH0_CLIENT_ID="EM2LUFQm7vU6qkTTLtjQvd1C6LLHOFNk" 
AUTH0_SECRET="240203b3d17649ecd2365756b62c046cd3b8f7904849dfb50d3e5bc138cd778a"  
MONGODB_URI="mongodb+srv://azelbycatherine_db_user:7hWhzDeIpV31iv70@db-cs4530-fall25-201.dh81ren.mongodb.net"  

AUTH0_AUDIENCE="https://dev-yipqv2u1k7drpppn.us.auth0.com/api/v2/"  
AUTH0_DOMAIN="dev-yipqv2u1k7drpppn.us.auth0.com"  
SERVER_URL="http://localhost:8000/"  

### `/client`
VITE_AUTH0_DOMAIN="dev-yipqv2u1k7drpppn.us.auth0.com"  
VITE_AUTH0_CLIENT_ID="EM2LUFQm7vU6qkTTLtjQvd1C6LLHOFNk"                             
VITE_AUTH0_AUDIENCE="https://dev-yipqv2u1k7drpppn.us.auth0.com/api/v2/"    
VITE_SERVER_URL="http://localhost:8000/"  

### `/testing`
MONGODB_URI="mongodb+srv://azelbycatherine_db_user:7hWhzDeIpV31iv70@db-cs4530-fall25-201.dh81ren.mongodb.net"
