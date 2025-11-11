# Warehouse Inventory App

_[Portfolio link](https://sang53.github.io/)_

_[Deployed link](https://warehouse-inventory-production-ba35.up.railway.app/)_
_Note: Slow on initial load due to sleeping deployment_

This project was made for the purpose of learning back-end web development.
It is a TypeScript + Express web application for managing a simulated warehouse inventory.

Project reflection at `plan/reflection.txt`

---

## Key Features

- **CRUD operations** using PostgreSQL & node-postgres / pg
- **Concurrency/Race conditions** handled via transactional queries
- **User authentication and session management** with Passport.js & express-session
- **Modular architecture** containing controllers, services, models & views
- **Graceful error handling** with appropriate status codes
- **Server-rendered UI** using EJS view engine

---

## Overview

The Warehouse Inventory App provides an interface for warehouse staff to access and manage warehouse data, and provide automated tasks to workers according to their roles.

- Tracks products, locations, pallets, orders, tasks & users, which can be accessed via grouped & individual routes.
- Orders generate tasks for warehouse staff to complete.
- Tasks are automatically assigned pallets, products and free locations as required.
- Logged in users are assigned tasks according to their respective roles.
- When users complete their task, the database is updated and the next task in the chain is generated.

---

## Usage Flow

1. **Sign In**

- Visit any route in domain
- Enter account details from below:

  | Username | Password |
  | -------- | -------- |
  | admin    | admin    |
  | intake   | intake   |
  | picker   | picker   |
  | outgoing | outgoing |

2. **Current Task** - _non-admins_

- After authentication, the user is assigned & redirected to their current task.
- Once the current task is marked complete, the user is assigned a new task - _ordered by oldest_.
- Non-admins have access to viewing inventory data _(for easier exploring)_, but cannot add any new data.

3. **Warehouse Management** - _admins_

- After authentication, the admin is redirected to the dashboard/index where they can view current tasks & orders.
- Admins have access to adding new data - products, orders & users.
- Admins can complete tasks via the individual task page and can designate a different user to have completed the task.
  ***

## Route Layout

> All routes except /login require authentication to access

| Endpoint                               | Purpose                             |
| -------------------------------------- | ----------------------------------- |
| `/`                                    | Current tasks & orders (for admins) |
| `/current`                             | Current Task (for non-admin users)  |
| `/login` & `/logout`                   | `/login`, `/logout`                 |
| `/users`                               | View & Add users                    |
| `/locations`                           | View locations                      |
| `/pallets`                             | View pallets                        |
| `/products`                            | View & Add products                 |
| `/orders`                              | View & Add orders                   |
| `/tasks`                               | View & Complete (admin) tasks       |
| `:group/id/:id`                        | View individual page                |
| `:group/new`                           | Form for adding new data            |
| `:group/incomplete`, `:group/complete` | View for tasks & orders             |
