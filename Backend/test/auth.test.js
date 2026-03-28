const { assert } = require("chai");
const fetch = require("node-fetch");

describe("Auth API Tests", function () {
  this.timeout(10000);

  const baseURL = "http://localhost:3000";

  const testUser = {
    email: `test${Date.now()}@test.com`,
    password: "testpassword123",
    username: "testuser"
  };

  it("should create a new user", async () => {
    const res = await fetch(`${baseURL}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testUser)
    });

    const data = await res.json();

    assert.isTrue(data.success);
    assert.exists(data.uid);
  });

  it("should fail signup with missing fields", async () => {
    const res = await fetch(`${baseURL}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "",
        password: "",
        username: ""
      })
    });

    const data = await res.json();

    assert.isFalse(data.success);
  });

  it("should fail signup with short password", async () => {
    const res = await fetch(`${baseURL}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: `short${Date.now()}@test.com`,
        password: "123",
        username: "shortuser"
      })
    });

    const data = await res.json();

    assert.isFalse(data.success);
  });

  it("should login and return a custom token", async () => {
    await new Promise(res => setTimeout(res, 1000));

    const res = await fetch(`${baseURL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await res.json();

    console.log("Login response:", data);

    assert.isTrue(data.success);
    assert.exists(data.customToken);
  });

  it("should fail login with wrong password", async () => {
    const res = await fetch(`${baseURL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: testUser.email,
        password: "wrongpassword"
      })
    });

    const data = await res.json();

    assert.isFalse(data.success);
  });

  it("should fail login with non-existent user", async () => {
    const res = await fetch(`${baseURL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: `nouser${Date.now()}@test.com`,
        password: "somepassword123"
      })
    });

    const data = await res.json();

    assert.isFalse(data.success);
  });

  it("should fail login with missing fields", async () => {
    const res = await fetch(`${baseURL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "",
        password: ""
      })
    });

    const data = await res.json();

    assert.isFalse(data.success);
  });

});