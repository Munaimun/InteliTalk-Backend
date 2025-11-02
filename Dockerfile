# ----------- Stage 1: Builder -----------
FROM node:22-alpine AS builder

WORKDIR /build

# Copy dependency files first for better caching
COPY package*.json ./

# Install all deps (including dev) for build step
RUN npm install --force

# Copy the rest of your app source
COPY . .

# Run build (if applicable)
# For plain Express APIs, you can skip this
RUN npm run build || echo "No build script found"

# ----------- Stage 2: Runner -----------
FROM node:22-alpine AS runner

# Create a non-root user within Choreo-compliant UID range (10000–20000)
RUN addgroup -g 10001 appgroup && adduser -u 10001 -G appgroup -S appuser

WORKDIR /app

# Copy only necessary files
COPY --from=builder /build/package*.json ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist  
COPY --from=builder /build/.env* ./ 
COPY --from=builder /build/*.js ./       

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose the port (Choreo detects this)
EXPOSE 5001

# Switch to secure, non-root user
USER 10001

# Start the application
CMD ["npm", "start"]
