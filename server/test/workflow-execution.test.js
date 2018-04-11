describe('Workflow Execution', function() {
  it('should describe the workflow', async function () {
    this.test.DescribeWorkflowExecution = ({ describeRequest }) => {
      return {
        executionConfiguration: {
          taskList: { name: 'ci-task-list' },
          taskStartToCloseTimeoutSeconds: 10
        }
      }
    }

    return request()
      .get('/api/domain/canary/workflows/ci%2Fdemo/run1')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({
        executionConfiguration: {
          childPolicy: null,
          taskList: {
            name: 'ci-task-list',
            kind: null
          },
          taskStartToCloseTimeoutSeconds: 10,
          executionStartToCloseTimeoutSeconds: null
        },
        workflowExecutionInfo: null,
        pendingActivities: null
      })
  })

  describe('Queries', function() {
    it('should forward the query to the workflow', async function () {
      this.test.QueryWorkflow = ({ queryRequest }) => {
        queryRequest.should.deep.equal({
          domain: 'canary',
          execution: {
            workflowId: 'ci/demo',
            runId: 'run1'
          },
          query: {
            queryType: 'state',
            queryArgs: null
          }
        })

        return { queryResult: Buffer.from('foobar') }
      }

      return request(global.app)
        .post('/api/domain/canary/workflows/ci%2Fdemo/run1/query/state')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({
          queryResult: 'foobar',
          queryResult_base64: Buffer.from('foobar').toString('base64')
        })
    })

    it('should forward the body as the query input')

    it('should turn bad requests into 400s', async function () {
      this.test.QueryWorkflow = () => ({
        ok: false,
        body: { message: 'that does not make sense' },
        typeName: 'badRequestError'
      })

      return request()
        .post('/api/domain/canary/workflows/ci%2Fdemo/run1/query/state')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect({
          message: 'that does not make sense'
        })
    })
  })
})