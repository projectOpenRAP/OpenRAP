package config

import (
	"io"
	"io/ioutil"
	"log"
	"os"
	"sync/atomic"
)

const systemAlertSubject = "TraceLog Exception"

const (
	// LevelTrace logs everything
	LevelTrace int32 = 1

	// LevelInfo logs Info, Warnings and Errors
	LevelInfo int32 = 2

	// LevelWarn logs Warning and Errors
	LevelWarn int32 = 4

	// LevelError logs just Errors
	LevelError int32 = 8
)

// traceLog provides support to write to log files.
type Tracelog struct {
	LogLevel int32
	Trace    *log.Logger
	Info     *log.Logger
	Warning  *log.Logger
	Error    *log.Logger
	File     *log.Logger
	LogFile  *os.File
}

// log maintains a pointer to a singleton for the logging system.
var logger *Tracelog

func LoggerInit(logfile string) *Tracelog {

	if logger != nil {
		return logger
	}

	// FIXME: Need log rotation, till then create the log file in /tmp
	logfile = "/tmp/searchServer.log"

	log.SetPrefix("TRACE: ")
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	logf, err := os.OpenFile(logfile, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
	if err != nil {
		log.Println("cannot create log file: ", err)
	}

	// Create a new logger
	//logger = &Tracelog{LevelTrace, ioutil.Discard, ioutil.Discard, ioutil.Discard, ioutil.Discard, ioutil.Discard, logf}
	logger = &Tracelog{LevelTrace, nil, nil, nil, nil, nil, logf}

	// Turn the logging trace level
	turnOnLogging(LevelTrace, logf)

	logger.Trace.Printf("Storing the log messages into file: %s\n", logfile)

	return logger
}

// Start initializes tracelog and only displays the specified logging level.
func Start(logLevel int32) {
	turnOnLogging(logLevel, nil)
}

// Stop will release resources and shutdown all processing.
func Stop() error {

	var err error
	if logger.LogFile != nil {
		err = logger.LogFile.Close()
	}

	return err
}

// LogLevel returns the configured logging level.
func LogLevel() int32 {
	return atomic.LoadInt32(&logger.LogLevel)
}

// turnOnLogging configures the logging writers.
func turnOnLogging(logLevel int32, fileHandle io.Writer) {
	traceHandle := ioutil.Discard
	infoHandle := ioutil.Discard
	warnHandle := ioutil.Discard
	errorHandle := ioutil.Discard

	if logLevel&LevelTrace != 0 {
		traceHandle = os.Stdout
		infoHandle = os.Stdout
		warnHandle = os.Stdout
		errorHandle = os.Stderr
	}

	if logLevel&LevelInfo != 0 {
		infoHandle = os.Stdout
		warnHandle = os.Stdout
		errorHandle = os.Stderr
	}

	if logLevel&LevelWarn != 0 {
		warnHandle = os.Stdout
		errorHandle = os.Stderr
	}

	if logLevel&LevelError != 0 {
		errorHandle = os.Stderr
	}

	if fileHandle != nil {
		if traceHandle == os.Stdout {
			traceHandle = io.MultiWriter(fileHandle, traceHandle)
		}

		if infoHandle == os.Stdout {
			infoHandle = io.MultiWriter(fileHandle, infoHandle)
		}

		if warnHandle == os.Stdout {
			warnHandle = io.MultiWriter(fileHandle, warnHandle)
		}

		if errorHandle == os.Stderr {
			errorHandle = io.MultiWriter(fileHandle, errorHandle)
		}
	}

	logger.Trace = log.New(traceHandle, "TRACE: ", log.Ldate|log.Ltime|log.Lshortfile)
	logger.Info = log.New(infoHandle, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	logger.Warning = log.New(warnHandle, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
	logger.Error = log.New(errorHandle, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)

	atomic.StoreInt32(&logger.LogLevel, logLevel)
}
