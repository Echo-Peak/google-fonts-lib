**Google-fonts-lib** is simple command-line API to save fonts at the CWD either for offline use or for online use.

##Install
```npm i google-fonts-lib```

###Usage
This will create a `fonts` folder or use `fonts` folder to store these files.

```gf get "Roboto"``` Will place `roboto` at /font/roboto.css



You can use the `local`  param to save font locally.

```gf get "Roboto" local```

Will place `roboto` at /font/roboto/roboto.css and

Will place `woff2 files` at /font/roboto/font.
