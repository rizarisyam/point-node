class CreateFormRequest {
  constructor(tenantDatabase, { maker, createFormRequestDto }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.createFormRequestDto = createFormRequestDto;
  }

  async call() {
    // CreateFormRequest
  }
}

module.exports = CreateFormRequest;
