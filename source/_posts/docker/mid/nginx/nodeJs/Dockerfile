# 生成镜像所需的nginx基础镜像
FROM nginx:latest
# 作者名称<邮箱>
MAINTAINER Fa <fa@163.com>
# 删除nginx的默认配置，这里也可以不删除，但必须创建一个以.conf为后缀的配置文件，而且必须在**/conf.d/文件夹下
RUN rm /etc/nginx/conf.d/default.conf
# 添加自己创建的**.conf配置文件到nginx默认的配置文件路径下，conf.d/default.conf为需要创建的文件及路径，也就是上图中的第一个文件夹
ADD conf.d/default.conf /etc/nginx/conf.d/
# 复制项目到nginx配置文件配置的访问目录，dist/是上图中所示项目打成的包，/usr/share/nginx/snnu_ui/为配置文件所填的访问目录
COPY dist/  /usr/share/nginx/snnu_ui/
