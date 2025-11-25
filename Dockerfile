# Use an official Node.js runtime as the base image
FROM node:slim

# Set the working directory inside the container
WORKDIR /home/damien/Development/svt_admin

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app files to the container
COPY . .

# Build the Svelte app
RUN npm run build
ENV VITE_PHX_ENDPOINT=localhost:8512
# Expose the port that the app will run on
EXPOSE 4173
# Command to start the app
CMD [ "npm", "run", "start" ]
