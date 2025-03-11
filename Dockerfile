# Use an official Node runtime as a parent image
FROM node:23

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package files and lock file to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install project dependencies
RUN pnpm install

# Copy all project files into the container
COPY . .

# Expose the port on which the app runs (5173 as per Vite output)
EXPOSE 5173

# Start the development server
CMD ["pnpm", "dev"]
