# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ikayiban <ikayiban@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/02 18:30:57 by ikayiban          #+#    #+#              #
#    Updated: 2026/04/08 16:54:01 by ikayiban         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM node:24-bookworm

RUN apt-get update \ 
    && apt-get install -y netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

RUN npx prisma generate --schema=./database/schema.prisma

RUN npm run build

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]