import { useState, useEffect, Fragment } from "react";
import bridge, { UserInfo } from "@vkontakte/vk-bridge";
import { v4 as uuidv4 } from "uuid";
import {
  View,
  SplitLayout,
  SplitCol,
  AppRoot,
  Panel,
  Group,
  Avatar,
  Button,
  Flex,
  Banner,
  Div,
  Textarea,
  PanelHeaderBack,
  ButtonGroup,
  ModalCard,
  Spacing,
  ModalRoot,
  Input,
  Placeholder,
} from "@vkontakte/vkui";
import {
  Icon24AddSquareOutline,
  Icon56GhostOutline,
  Icon28EditOutline,
  Icon28DeleteOutline,
} from "@vkontakte/icons";
import { Todo } from "./types/todo.model.ts";
import "./style.css";

export const App = () => {
  const [fetchedUser, setUser] = useState<UserInfo | undefined>();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentTodo, setCurrentTodo] = useState<Todo>({
    id: "",
    title: "",
    text: "",
    createdAt: new Date().toISOString(),
  });
  const [activePanel, setActivePanel] = useState<string>("main");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<string>("");
  const [todoToEdit, setTodoToEdit] = useState<Todo>({
    id: "",
    title: "",
    text: "",
    createdAt: "",
  });

  useEffect(() => {
    bridge.send("VKWebAppGetUserInfo").then((data) => console.log(data));
    async function fetchData() {
      const user = await bridge.send("VKWebAppGetUserInfo");
      bridge.send("VKWebAppStorageGet", { keys: ["todos"] }).then((data) => {
        const todos = data.keys.filter((item) => item.key === "todos");
        setTodos(JSON.parse(todos[0].value));
      });
      setUser(user);
    }
    fetchData();
  }, []);

  const storeTodo = async (arr: Todo[]) => {
    await bridge.send("VKWebAppStorageSet", {
      key: "todos",
      value: JSON.stringify(arr),
    });
  };

  const addTodo = () => {
    const todosToSave = [
      ...todos,
      {
        id: uuidv4(),
        title: currentTodo.title,
        text: currentTodo.text,
        createdAt: new Date().toISOString(),
      },
    ];

    setTodos(todosToSave);
    setCurrentTodo({ id: "", title: "", text: "", createdAt: "" });
    storeTodo(todosToSave);
    setActivePanel("main");
  };

  const deleteConfirmation = (id: string) => {
    setActiveModal("delete");
    setTodoToDelete(id);
  };

  const deleteTodo = () => {
    const filteredTodos = todos.filter((item) => item.id !== todoToDelete);

    setTodos(filteredTodos);
    storeTodo(filteredTodos);

    setActiveModal(null);
  };

  const editTodo = () => {
    const arr = todos.map((item) => {
      if (item.id === todoToEdit.id) {
        return { ...item, text: todoToEdit.text, title: todoToEdit.title };
      } else {
        return item;
      }
    });

    setTodos(arr);
    storeTodo(arr);
    setActivePanel("main");
  };

  return (
    <AppRoot>
      <SplitLayout>
        <SplitCol autoSpaced>
          <View activePanel={activePanel}>
            <Panel id="main" mode={"card"}>
              <Group className={"panelHeight"} style={{ padding: "16px" }}>
                <Flex
                  align={"center"}
                  justify={"space-between"}
                  style={{ marginBottom: "16px", marginTop: "25px" }}
                >
                  <Flex gap={"s"} align={"center"}>
                    <Avatar size={36} src={fetchedUser?.photo_200} />
                    <Div>
                      {"Привет, " + (fetchedUser?.first_name || "Пользователь")}
                    </Div>
                  </Flex>
                </Flex>
                <Button
                  onClick={() => setActivePanel("add")}
                  style={{ marginBottom: "25px" }}
                >
                  Добавить задачу
                </Button>
                <Flex direction={"column"} gap={"m"}>
                  {todos && todos.length > 0 ? (
                    todos.map((todo, index) => (
                      <Banner
                        key={index}
                        header={
                          <span style={{ fontSize: "18px", fontWeight: "600" }}>
                            {todo.title}
                          </span>
                        }
                        subheader={
                          <div style={{ marginTop: "8px" }}>
                            <div
                              style={{
                                fontSize: "15px",
                                lineHeight: "20px",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: todo.text.replace(/\n/g, "<br/>"),
                              }}
                            />
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#818C99",
                                marginTop: "12px",
                              }}
                            >
                              {`Создано: ${new Date(todo.createdAt).toLocaleDateString()}`}
                            </div>
                          </div>
                        }
                        actions={
                          <ButtonGroup mode="horizontal" gap="m">
                            <Button
                              onClick={() => {
                                setTodoToEdit(todo);
                                setActivePanel("edit");
                              }}
                              before={<Icon28EditOutline />}
                              size="m"
                              style={{ minWidth: "auto" }}
                            >
                              Редактировать
                            </Button>
                            <Button
                              onClick={() => deleteConfirmation(todo.id)}
                              before={<Icon28DeleteOutline />}
                              size="m"
                              mode="destructive"
                            >
                              Удалить
                            </Button>
                          </ButtonGroup>
                        }
                        mode="shadow"
                      />
                    ))
                  ) : (
                    <Placeholder
                      icon={<Icon56GhostOutline style={{ color: "#818C99" }} />}
                      header="Список задач пуст"
                    >
                      Добавьте свою первую задачу, нажав на кнопку выше
                    </Placeholder>
                  )}
                </Flex>
              </Group>
            </Panel>
            <Panel id="add" mode={"card"}>
              <Group className={"panelHeight"} style={{ padding: "16px" }}>
                <PanelHeaderBack
                  label="Назад"
                  onClick={() => setActivePanel("main")}
                />
                <Div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "24px",
                    textAlign: "center",
                  }}
                >
                  Создание задачи
                </Div>
                <Div>
                  <Input
                    value={currentTodo.title}
                    onChange={(e) =>
                      setCurrentTodo({
                        ...currentTodo,
                        title: e.target.value,
                      })
                    }
                    placeholder="Например: Купить продукты"
                    top="Название задачи"
                    style={{ marginBottom: "16px", marginTop: "16px" }}
                  />
                  <Spacing size={16} />
                  <Textarea
                    value={currentTodo.text}
                    onChange={(e) =>
                      setCurrentTodo({ ...currentTodo, text: e.target.value })
                    }
                    placeholder="Опишите задачу подробнее..."
                    rows={5}
                    top="Описание задачи"
                    style={{ marginBottom: "16px" }}
                  />
                  <Spacing size={16} />
                  <Button
                    size="m"
                    onClick={() => addTodo()}
                    before={<Icon24AddSquareOutline />}
                  >
                    Создать задачу
                  </Button>
                </Div>
              </Group>
            </Panel>
            <Panel id="edit" mode={"card"}>
              <Group className={"panelHeight"} style={{ padding: "16px" }}>
                <PanelHeaderBack
                  label="Назад"
                  onClick={() => setActivePanel("main")}
                  style={{ marginBottom: "16px", marginTop: "25px" }}
                />
                <Div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    textAlign: "center",
                  }}
                >
                  Редактирование задачи
                </Div>
                <Input
                  value={todoToEdit.title}
                  onChange={(e) =>
                    setTodoToEdit({ ...todoToEdit, title: e.target.value })
                  }
                  placeholder="Введите название задачи"
                  top="Название задачи"
                  style={{ marginBottom: "16px", marginTop: "16px" }}
                />
                <Textarea
                  cols={20}
                  rows={3}
                  value={todoToEdit.text}
                  onChange={(e) =>
                    setTodoToEdit({ ...todoToEdit, text: e.target.value })
                  }
                  placeholder="Введите описание задачи"
                  top="Описание задачи"
                  style={{ marginBottom: "16px" }}
                />
                <Button
                  onClick={() => editTodo()}
                  size="m"
                  before={<Icon28EditOutline />}
                >
                  Сохранить
                </Button>
              </Group>
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>

      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id={"delete"}
          onClose={() => setActiveModal(null)}
          header="Удалить"
          subheader="Вы уверенны что хотите удалить эту запись?"
          actions={
            <Fragment>
              <Spacing size={16} />
              <Button
                size="l"
                mode="destructive"
                stretched
                before={<Icon28DeleteOutline />}
                onClick={() => deleteTodo()}
              >
                Да
              </Button>
            </Fragment>
          }
        />
      </ModalRoot>
    </AppRoot>
  );
};
