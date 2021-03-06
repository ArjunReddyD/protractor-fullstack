/*
 * protractor-fullstack
 * https://github.com/Dmitry.Mogilko/protractor-fullstack
 *
 * Copyright (c) 2015 Dmitry Mogilko
 * Licensed under the MIT license.
 */

var config = require('../../configuration/appConfig.js');

var colors = require('colors');

var request = require('request');

var fs = require('fs');

var path = require('path');

var nodeUtil = require('util');

var util = {

    EC: protractor.ExpectedConditions,

    defaults: {
        waitTimeout: 5000
    },

    /**
     * Saves current screenshort .png file
     * @example <caption>saveScreenShort(path.join(__dirname,"screenshorts/test.png"));</caption>
     * @filePath  - where to save screeshort .Absolute path expected
     * @returns Promise
     */
    saveScreenShort: function (filepath) {
        return browser.takeScreenshot().then(function (png) {
            var fullPathName = path.join(filepath);
            var stream = fs.createWriteStream(fullPathName);
            stream.write(new Buffer(png, 'base64'));
            stream.end();

        });

    },

    /**
     * Safely navigate to new url while settings the window height and width to avoid bugs related to it
     * @param Url to Navigate to
     * @param options
     * @windowWidth  : set the window width (default : 1280)
     * @windowHeight  : set the window height (default  : 1204)
     * @waitForAngular  : if to wait for angular to finish internal tasks (default  :true)
     * @ignoreSynchronization  : if ignore synchronization with  angular (default  :false)
     */
    goToUrl: function (url, options) {

        var defaultWindowOptions = {
            windowHeight: 1024,
            windowWidth: 1280,
            waitForAngular: true,
            ignoreSynchronization: false
        };

        var optionsToApply = defaultWindowOptions;

        if (url) {

            if (options) {

                optionsToApply = nodeUtil._extend(defaultWindowOptions, options);
            }

            console.log("Go to url options:", optionsToApply);

            if (optionsToApply.ignoreSynchronization) {
                console.log("Ignoring synchronization..");
                browser.ignoreSynchronization = optionsToApply.ignoreSynchronization
            }


            browser.get(url);




            if (optionsToApply.waitForAngular === true) {
                browser.waitForAngular();
            }
        }


    },

    /**
     * Returns promise resolving current browser name
     */
    getBrowserName: function () {
        browser.getCapabilities().then(function (cap) {
            return cap.caps_.browserName;
        });
    },

    /**
     * Returns promise reolving if current browser is Internet Explorer
     */
    isIE: function () {
        util.getBrowserName().then(function (browserName) {
            return browserName.indexOf("Internet Explorer") > -1;
        });
    },

    /**
     * Switch the browser to newly opened window
     */
    switchToNewWindow: function () {
        browser.getAllWindowHandles().then(function (handles) {
            if (handles && handles.length > 0) {
                newWindowHandle = handles[handles.length - 1];
                return browser.switchTo().window(newWindowHandle);
            }
            return;

        });
    },

    /**
     * Cookie manipulation methods
     */
    cookies: {

        /**
         *
         * @param options
         * @options.name - cookie name
         * @options.value - cookie value
         * @options.domain - cookie domain
         * @options.isSecure - cookie isSecure
         * @options.expiry date  - cookie isSecure
         *
         */
        add: function (options) {

            if (options) {
                if (options.name && options.value) {
                    var defaultOptions = {};
                    var optionsToApply = defaultOptions;
                    optionsToApply = nodeUtil._extend(defaultOptions, options);
                    return browser.manage().addCookie(options.name, options.value, options.path, options.domain, options.isSecure, options.expiry);
                }
                else {
                    throw new Error("Options object for setting cookie is not valid.Must provide both the name and the value for cookie");
                }
            }


        },

        /**
         *
         * @param name  - name of the cookie
         * @returns {Promise}
         */
        get: function (name) {
            return browser.manage().getCookie(name);
        },

        /**
         * Delete the cookie
         * @param name   - name of the cookie
         * @returns {Promise}
         */
        delete: function (name) {
            return browser.manage().deleteCookie(name);
        },

        /**
         * Delete all cookies
         */
        deleteAll: function () {
            return browser.manage().deleteAllCookies();
        },

        /**
         * Get all cookies
         * @returns {Promise}
         */
        getAll: function () {
            return browser.manage().getCookies();
        }


    },

    /**
     * Dom manipulation methods
     */
    DOM: {

        /**
         * Set value into file upload
         * @param filePath  - path of the file to upload
         * @param fileInput  - WebElement file input
         */
        setFileUpload: function (filePath, fileInput) {
            fileInput.sendKeys(filePath);
        },


        /**
         * Input text into the input
         * @param element
         * @param inputText
         */
        inputText: function (element, inputText) {
            element.sendKeys(inputText);
        },

        /**
         * Press key on element
         * @param element
         * @param key
         */
        elementPressKey: function (element, key) {
            element.sendKeys(key);
        },


        /**
         * Mouse move over the element
         * @param element
         */

        elementMouseMove: function (element) {
            return browser.actions().mouseMove(element).perform();
        },

        /**
         * Mouse out of element
         * @param element
         */
        elementMouseOut: function (element) {
            /**
             * move mouse to arbitary location
             */
            browser.actions().mouseMove({x: 400, y: 0}).perform();
        },


        /**
         * Right click on element
         * @param element
         */
        elementRightClick: function (element) {
            browser.actions().mouseMove(element).click(protractor.Button.right);
        },


        /**
         * Double clickon element
         * @param element
         */
        elementDoubleClick: function (element) {
            browser.actions().doubleClick(element).perform();
        },


        /**
         * Wait until element will be visible or timeout will elapse
         * @param elem
         * @param timeout
         */
        waitForElementToBeVisible: function (elem, timeout) {
            browser.wait(util.EC.visibilityOf(elem), timeout || util.defaults.waitTimeout);
        },

        /**
         * Wait until element will be hidden or timeout will elapse
         * @param elem
         * @param timeout
         */
        waitForElementToBeInVisible: function (elem, timeout) {
            browser.wait(util.EC.invisibilityOf(elem), timeout || util.defaults.waitTimeout);
        },


        /**
         * Wait until element will be prerent in DOM or timeout will elapse
         * @param elem
         * @param timeout
         */
        waitElementToBePresent: function (elem, timeout) {

            browser.wait(util.EC.presenceOf(elem), timeout || util.defaults.waitTimeout);
        },


        /**
         * Wait until element will be removed from DOM or timeout will elapse
         * @param elem
         * @param timeout
         */
        waitForElementToDisappear: function (elem, timeout) {
            browser.wait(util.EC.EC.stalenessOf(elem), timeout || util.defaults.waitTimeout);
        },

        /**
         *
         * @param element  -   WebElement to check the class on
         * @param className - the name of the class
         * @returns {*|webdriver.promise.Promise}
         */
        hasClass: function (element, className) {
            return element.getAttribute('class').then(function (classes) {

                return classes.split(' ').indexOf(className) !== -1;
            });


        }

    }


};


module.exports = util;


