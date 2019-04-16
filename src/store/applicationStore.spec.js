// mocha src/store/applicationStore.spec.js --require babel-core/register --exit

import { expect } from 'chai'
import sinon from 'sinon'
import WindowMock from 'window-mock';
const waitForExpect = require("wait-for-expect")
mockWindow() 
import * as Sentry from "@sentry/browser"
const sentryTestkit = require("sentry-testkit")
const { testkit, sentryTransport } = sentryTestkit()

const { mutations } = require('./applicationStore')


function mockWindow() {
    global.window  = new WindowMock();
    window.location.host = "http://localhost"
    global.sessionStorage  = global.window.sessionStorage;
    sessionStorage.setItem('userIsLoggedIn', false)
}

describe('mutations', () => {

    beforeEach(mockWindow)

    describe('setErrorMsg', () => {
        const { setErrorMsg } = mutations

        beforeEach(() => {
            testkit.reset()
        })

        it('reports to Sentry if specified', async () => {

            // initialize your Sentry instance with sentryTransport
            Sentry.init({
                dsn: 'https://foo@sentry.io/bar',
                transport: sentryTransport
                //... other configurations
            })
            
            // mock state
            const state = { errorMsg: null }
            const payload = {msg: "An action failed", report:true, cause: new Error("Some root error")}
            // apply mutation
            setErrorMsg(state,payload)
            // assert result
            expect(state.errorMsg).to.equal(payload.msg)


            await waitForExpect(() => {
                expect(testkit.reports()).to.have.length(1)
            })
            let report = testkit.reports()[0]
            const {type, value} = testkit.extractException(report)
            expect(type).to.equal('Error')
            expect(value).to.equal("An action failed: Some root error")
        })
    })
})