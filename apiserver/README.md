# README #

This is the REST api server for Ekstep opencdn platform.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* 1. Install go tool (skip, if you have already a go workspace)
    a. Download from the following links:
        (linux) https://storage.googleapis.com/golang/go1.8.3.linux-amd64.tar.gz
        (mac) https://storage.googleapis.com/golang/go1.8.3.darwin-amd64.pkg
    b. untar into /usr/local/ directory
        tar -C /usr/local -xzf go$VERSION.$OS-$ARCH.tar.gz
    c. Create a go workspace in $HOME/go directory
        mkdir -p $HOME/go/{bin,pkg,src}  //no space among commas
    d. Set the ENV variables (see source_env_go file)
        export GOPATH=$HOME/go
        export GOBIN=$GOPATH/bin
        export PATH=/usr/local/go/bin:$GOBIN:$PATH
    e. Install go 'dep' tool
        go get -u github.com/golang/dep/cmd/dep

