# vscode remote ssh

## glibc >= 2.28, libstdc++ >= 3.4.25

```bash
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
# 安装 SCL 仓库
yum install -y centos-release-scl
# 尝试安装
yum install -y devtoolset-8-gcc*

```

### 安装`devtoolset-8-gcc*`时, 报链接访问不了的错

替换为阿里云的链接

```bash
cd /etc/yum.repos.d/
mv CentOS-SCLo-scl.repo CentOS-SCLo-scl.repo.bak
mv CentOS-SCLo-scl-rh.repo CentOS-SCLo-scl-rh.repo.bak

```

文件一：CentOS-SCLo-scl.repo

```bash
[centos-sclo-sclo]
name=CentOS-7 - SCLo sclo
baseurl=https://mirrors.aliyun.com/centos/7/sclo/$basearch/sclo/
gpgcheck=1
enabled=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-SIG-SCLo

[centos-sclo-sclo-testing]
name=CentOS-7 - SCLo sclo Testing
baseurl=http://buildlogs.centos.org/centos/7/sclo/$basearch/sclo/
gpgcheck=0
enabled=0

[centos-sclo-sclo-source]
name=CentOS-7 - SCLo sclo Sources
baseurl=http://vault.centos.org/centos/7/sclo/Source/sclo/
gpgcheck=1
enabled=0

[centos-sclo-sclo-debuginfo]
name=CentOS-7 - SCLo sclo Debuginfo
baseurl=http://debuginfo.centos.org/centos/7/sclo/$basearch/debuginfo/
gpgcheck=1
enabled=0

```

文件二：CentOS-SCLo-scl-rh.repo

```bash
[centos-sclo-rh]
name=CentOS-7 - SCLo rh
baseurl=https://mirrors.aliyun.com/centos/7/sclo/x86_64/rh/
gpgcheck=1
enabled=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-SIG-SCLo

[centos-sclo-rh-testing]
name=CentOS-7 - SCLo rh Testing
baseurl=http://buildlogs.centos.org/centos/7/sclo/x86_64/rh/
gpgcheck=0
enabled=0

[centos-sclo-rh-source]
name=CentO-7 - SCLo rh Sources
baseurl=http://vault.centos.org/centos/7/sclo/Source/rh/
gpgcheck=1
enabled=0

[centos-sclo-rh-debuginfo]
name=CentOS-7 - SCLo rh Debuginfo
baseurl=http://debuginfo.centos.org/centos/7/sclo/x86_64/debuginfo/
gpgcheck=1
enabled=0

```

```bash
yum clean all
yum makecache
# 验证
yum repolist | grep scl
# 安装
yum install -y devtoolset-8-gcc*
```

### glibc >= 2.28(升级)

```bash
# 查看系统内安装的glibc版本
strings /lib64/libc.so.6 |grep GLIBC_
# 更新glibc
wget http://ftp.gnu.org/gnu/glibc/glibc-2.28.tar.gz
tar xf glibc-2.28.tar.gz 
cd glibc-2.28/ && mkdir build  && cd build
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
```

可能出现的错误

```bash
configure: error: 
*** These critical programs are missing or too old: make bison compiler
*** Check the INSTALL file for required versions.
```

解决办法：升级gcc与make

```bash
# 升级GCC(默认为4 升级为8)</span>
yum install -y centos-release-scl
yum install -y devtoolset-8-gcc*
mv /usr/bin/gcc /usr/bin/gcc-4.8.5
ln -s /opt/rh/devtoolset-8/root/bin/gcc /usr/bin/gcc
mv /usr/bin/g++ /usr/bin/g++-4.8.5
ln -s /opt/rh/devtoolset-8/root/bin/g++ /usr/bin/g++

# 升级 make(默认为3 升级为4)
wget http://ftp.gnu.org/gnu/make/make-4.3.tar.gz
tar -xzvf make-4.3.tar.gz && cd make-4.3/
./configure  --prefix=/usr/local/make
make && make install
cd /usr/bin/ && mv make make.bak
ln -sv /usr/local/make/bin/make /usr/bin/make
```

这时 所有的问题 都已经解决完毕 再重新执行上一步 更新glibc即可

```bash
cd /root/glibc-2.28/build
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
```

我的依旧报错：bison太老旧

```bash
configure: error: 
*** These critical programs are missing or too old: bison
*** Check the INSTALL file for required versions.
```

看看我的bison版本多少

```bash
bison --version
# -bash: bison: 未找到命令

yum install -y bison
bison --version
```

这时 所有的问题 真的真的都已经解决完毕 再重新执行上一步 更新glibc即可

```bash
cd /root/glibc-2.28/build
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
```

继续更新

make 和 make install在linux中就是安装软件的意思 简单这么理解就好。
这个过程较长，大约半小时左右，建议打一局游戏就好了。

```bash
make && make install
# PS: 好像有error也不影响的样子, 要是连接不上, 就继续往后看就行
```

验证下 是不是好了(PS: 用vscode的remote-ssh连接远程服务器)

如果还是出现下面的问题，要连接新的动态库

```bash
node: /lib64/libstdc++.so.6: version `CXXABI_1.3.9' not found (required by node)
node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.20' not found (required by node)
node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.21' not found (required by node)
```

用下面命令查看

```bash
strings /usr/lib64/libstdc++.so.6 | grep CXXABI
```

更新libstdc++.so.6.0.26

```bash
# 更新lib libstdc++.so.6.0.26
 
wget https://cdn.frostbelt.cn/software/libstdc%2B%2B.so.6.0.26 --no-check-certificate
 
 
# 替换系统中的/usr/lib64
cp libstdc++.so.6.0.26 /usr/lib64/

cd /usr/lib64/

ln -snf ./libstdc++.so.6.0.26 libstdc++.so.6
```

再次验证(PS: 用vscode的remote-ssh连接远程服务器)

```bash
# 连接成功后, 可能遇到的新问题
# manpath: can't set the locale; make sure $LC_* and $LANG are correct
```

解决方法

```bash
# 检查当前时区
locale
# 可能会出现以下错误
$ locale
locale: Cannot set LC_ALL to default locale: No such file or directory
LANG=en_US.UTF-8
LC_CTYPE="en_US.UTF-8"
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="en_US.UTF-8"
LC_NAME="en_US.UTF-8"
LC_ADDRESS="en_US.UTF-8"
LC_TELEPHONE="en_US.UTF-8"
LC_MEASUREMENT="en_US.UTF-8"
LC_IDENTIFICATION="en_US.UTF-8"
LC_ALL=
```

```bash
# 生成缺失的区域设置
locale -a
# 编辑区域配置文件
vi /etc/locale.conf

# 添加以下内容
LANG=en_US.UTF-8
LC_ALL=en_US.UTF-8

# 生成区域设置
localedef -i en_US -f UTF-8 en_US.UTF-8

# 如果需要其他区域设置，可以相应更改 en_US 和 UTF-8。例如，对于简体中文：
localedef -i zh_CN -f UTF-8 zh_CN.UTF-8

# 设置环境变量临时生效
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# 你可以将这些命令添加到 ~/.bashrc 或 ~/.bash_profile 文件中，以便每次登录时自动设置：
echo 'export LANG=en_US.UTF-8' >> ~/.bashrc
echo 'export LC_ALL=en_US.UTF-8' >> ~/.bashrc
source ~/.bashrc

# 验证
locale
```

## 参考链接

[node: /lib64/libm.so.6: version `GLIBC_2.27‘ not found问题解决方案](https://www.cnblogs.com/yuwen01/p/18067005)
