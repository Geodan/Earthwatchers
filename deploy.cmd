
@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 0.1.5
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%src
)

IF NOT DEFINED DEPLOYMENT_DIST (
  SET DEPLOYMENT_DIST=%~dp0%dist\prod
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm --registry "http://registry.npmjs.org/" install kudusync -g
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=node "%appdata%\npm\node_modules\kuduSync\bin\kuduSync"
)

IF NOT DEFINED GRUNT_CMD (
  :: Install grunt
  echo Installing Grunt
  call npm --registry "http://registry.npmjs.org/" install grunt-cli
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "grunt" would also work
  SET GRUNT_CMD=node "%appdata%\npm\node_modules\grunt-cli\bin\grunt"

)


goto Deployment

:: Utility Functions
:: -----------------

:SelectNodeVersion

IF DEFINED KUDU_SELECT_NODE_VERSION_CMD (
  :: The following are done only on Windows Azure Websites environment
  call %KUDU_SELECT_NODE_VERSION_CMD% "%DEPLOYMENT_SOURCE%" "%DEPLOYMENT_TARGET%" "%DEPLOYMENT_TEMP%"
  IF !ERRORLEVEL! NEQ 0 goto error

  IF EXIST "%DEPLOYMENT_TEMP%\__nodeVersion.tmp" (
    SET /p NODE_EXE=<"%DEPLOYMENT_TEMP%\__nodeVersion.tmp"
    IF !ERRORLEVEL! NEQ 0 goto error
  )

  IF EXIST "%DEPLOYMENT_TEMP%\__npmVersion.tmp" (
    SET /p NPM_JS_PATH=<"%DEPLOYMENT_TEMP%\__npmVersion.tmp"
    IF !ERRORLEVEL! NEQ 0 goto error
  )

  IF NOT DEFINED NODE_EXE (
    SET NODE_EXE=node
  )

  SET NPM_CMD="!NODE_EXE!" "!NPM_JS_PATH!"
) ELSE (
  SET NPM_CMD=npm --registry "http://registry.npmjs.org/"
  SET NODE_EXE=node
)

goto :EOF

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

:Deployment
echo Handling node.js deployment.
echo %DEPLOYMENT_SOURCE%

:: 1. Select node version
call :SelectNodeVersion

:: 2. Install npm packages
echo Installing npm dev dependendencies
if EXIST "%DEPLOYMENT_SOURCE%\package.json" (
  pushd %DEPLOYMENT_SOURCE%
  echo Cleaning NPM cache.
  call !NPM_CMD! cache clean
  call !NPM_CMD! install --development
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
)

:: 3. Run grunt prod task
pushd %DEPLOYMENT_SOURCE%
call !GRUNT_CMD! prod
popd

:: 4. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call %KUDU_SYNC_CMD% -v 50 -f "%DEPLOYMENT_DIST%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error
)

:: 5. Install npm packages
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  pushd %DEPLOYMENT_TARGET%
  call !NPM_CMD! install --production
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

:: Post deployment stub
call %POST_DEPLOYMENT_ACTION%
IF !ERRORLEVEL! NEQ 0 goto error

goto end

:error
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
echo Finished successfully.