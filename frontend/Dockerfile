# Node base image with specific Debian distribution.
FROM    node:24-bookworm

# Working directory.
WORKDIR /app

# Copy the local directory into the /app container directory.
COPY    ./ /app

# Install all listed dependencies from package.json
RUN     npm install

# Svelte-kit listens on port 5500.
EXPOSE  5500

CMD ["npm", "run", "dev"]

#
# 使用 Node 24 作为基础镜像
#FROM node:24-bookworm

# 设置工作目录
#WORKDIR /app

# 复制本地项目文件到容器中的工作目录
#COPY ./ /app

# 复制 shared 目录到容器中
#COPY shared/ ./shared/

# 安装所有依赖
#RUN npm install

# 暴露前端的运行端口（SvelteKit 默认是 5500）
#EXPOSE 5500

# 设置默认命令来启动前端应用
#CMD ["npm", "run", "dev"]