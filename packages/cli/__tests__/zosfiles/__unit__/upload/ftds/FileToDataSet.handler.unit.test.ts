/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import { Upload } from "../../../../../../../packages/zosfiles/src/methods/upload";
import { UNIT_TEST_ZOSMF_PROF_OPTS } from "../../../../../../../__tests__/__src__/mocks/ZosmfProfileMock";

describe("Upload file-to-data-set handler", () => {
    describe("process method", () => {
        it("should upload a file to a data set if requested", async () => {
            // Require the handler and create a new instance
            const handlerReq = require("../../../../../src/zosfiles/upload/ftds/FileToDataSet.handler");
            const handler = new handlerReq.default();
            const inputfile = "test-file";
            const dataSetName = "testing";

            // Vars populated by the mocked function
            let error;
            let apiMessage = "";
            let jsonObj;
            let logMessage = "";
            let fakeSession = null;

            // Mock the submit JCL function
            Upload.fileToDataset = jest.fn((session) => {
                fakeSession = session;
                return {
                    success: true,
                    commandResponse: "uploaded",
                    apiResponse: [
                        {success: true, from: inputfile, to: dataSetName}
                    ]
                };
            });

            // Mocked function references
            const profFunc = jest.fn((args) => {
                return {
                    host: "fake",
                    port: "fake",
                    user: "fake",
                    password: "fake",
                    auth: "fake",
                    rejectUnauthorized: "fake"
                };
            });

            try {
                // Invoke the handler with a full set of mocked arguments and response functions
                await handler.process({
                    arguments: {
                        $0: "fake",
                        _: ["fake"],
                        inputfile,
                        dataSetName,
                        ...UNIT_TEST_ZOSMF_PROF_OPTS
                    },
                    response: {
                        data: {
                            setMessage: jest.fn((setMsgArgs) => {
                                apiMessage = setMsgArgs;
                            }),
                            setObj: jest.fn((setObjArgs) => {
                                jsonObj = setObjArgs;
                            })
                        },
                        console: {
                            log: jest.fn((logArgs) => {
                                logMessage += "\n" + logArgs;
                            })
                        },
                        progress: {
                            startBar: jest.fn((parms) => {
                                // do nothing
                            }),
                            endBar: jest.fn(() => {
                                // do nothing
                            })
                        }
                    },
                    profiles: {
                        get: profFunc
                    }
                } as any);
            } catch (e) {
                error = e;
            }

            expect(error).toBeUndefined();
            expect(profFunc).toHaveBeenCalledWith("zosmf", false);
            expect(Upload.fileToDataset).toHaveBeenCalledTimes(1);
            expect(Upload.fileToDataset).toHaveBeenCalledWith(fakeSession, inputfile, dataSetName, {
                task: {
                    percentComplete: 0,
                    stageName: 0,
                    statusMessage: "Uploading to data set"
                }
            });
            expect(jsonObj).toMatchSnapshot();
            expect(apiMessage).toMatchSnapshot();
            expect(logMessage).toMatchSnapshot();
        });
        it("should display error when upload file to data set", async () => {
            // Require the handler and create a new instance
            const handlerReq = require("../../../../../src/zosfiles/upload/ftds/FileToDataSet.handler");
            const handler = new handlerReq.default();
            const inputfile = "test-file";
            const dataSetName = "testing";

            // Vars populated by the mocked function
            let error;
            let apiMessage = "";
            let jsonObj;
            let logMessage = "";
            let fakeSession = null;

            // Mock the submit JCL function
            Upload.fileToDataset = jest.fn((session) => {
                fakeSession = session;
                return {
                    success: false,
                    commandResponse: "uploaded",
                    apiResponse: [
                        {success: false, from: inputfile, to: dataSetName}
                    ]
                };
            });

            // Mocked function references
            const profFunc = jest.fn((args) => {
                return {
                    host: "fake",
                    port: "fake",
                    user: "fake",
                    password: "fake",
                    auth: "fake",
                    rejectUnauthorized: "fake"
                };
            });

            try {
                // Invoke the handler with a full set of mocked arguments and response functions
                await handler.process({
                    arguments: {
                        $0: "fake",
                        _: ["fake"],
                        inputfile,
                        dataSetName,
                        ...UNIT_TEST_ZOSMF_PROF_OPTS
                    },
                    response: {
                        data: {
                            setMessage: jest.fn((setMsgArgs) => {
                                apiMessage = setMsgArgs;
                            }),
                            setObj: jest.fn((setObjArgs) => {
                                jsonObj = setObjArgs;
                            })
                        },
                        console: {
                            log: jest.fn((logArgs) => {
                                logMessage += "\n" + logArgs;
                            }),
                            error: jest.fn((logArgs) => {
                                logMessage += "\n" + logArgs;
                            })
                        },
                        progress: {
                            startBar: jest.fn(),
                            endBar: jest.fn()
                        }
                    },
                    profiles: {
                        get: profFunc
                    }
                } as any);
            } catch (e) {
                error = e;
            }

            expect(error).toBeDefined();
            expect(error.message).toBe("uploaded");
            expect(profFunc).toHaveBeenCalledWith("zosmf", false);
            expect(Upload.fileToDataset).toHaveBeenCalledTimes(1);
            expect(Upload.fileToDataset).toHaveBeenCalledWith(fakeSession, inputfile, dataSetName, {
                binary: undefined,
                volume: undefined,
                task: {
                    percentComplete: 0,
                    stageName: 0,
                    statusMessage: "Uploading to data set"
                }
            });
            expect(jsonObj).toMatchSnapshot();
            expect(apiMessage).toMatchSnapshot();
            expect(logMessage).toMatchSnapshot();
        });
    });
});
