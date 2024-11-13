import { useState, useEffect, Fragment } from "react";
import bridge, { UserInfo } from "@vkontakte/vk-bridge";
import { v4 as uuidv4 } from "uuid";
import {
  View,
  SplitLayout,
  SplitCol,
  AppRoot,
  Panel,
  PanelHeader,
  Group,
  Cell,
  Avatar,
  Button,
  Flex,
  Banner,
  PanelHeaderContent,
  Div,
  Textarea,
  PanelHeaderBack,
  ButtonGroup,
  ModalCard,
  Spacing,
  ModalRoot,
  Input,
} from "@vkontakte/vkui";
import { Todo } from "./types/todo.model.ts";
import { Icon16ListPlusOutline } from "@vkontakte/icons";
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
        console.log("load", todos);
        setTodos(JSON.parse(todos[0].value));
      });
      setUser(user);
    }
    fetchData();
  }, []);

  const storeTodo = async (arr: Todo[]) => {
    console.log("in fn", todos);
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
        <SplitCol autoSpaced >
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
                <Flex direction={"column"} gap={"xl"}>
                  {todos &&
                    todos.map((todo, index) => (
                      <Banner
                        key={index}
                        header={todo.title}
                        subheader={
                          <div>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: todo.text.replace(/\n/g, "<br/>"),
                              }}
                            />
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#888",
                                marginTop: "8px",
                              }}
                            >
                              {`Создано: ${new Date(todo.createdAt).toLocaleDateString()}`}
                            </div>
                          </div>
                        }
                        actions={
                          <ButtonGroup>
                            <Button
                              onClick={() => {
                                setTodoToEdit(todo);
                                setActivePanel("edit");
                              }}
                            >
                              Редактировать
                            </Button>
                            <Button onClick={() => deleteConfirmation(todo.id)}>
                              Удалить
                            </Button>
                          </ButtonGroup>
                        }
                      />
                    ))}
                </Flex>
              </Group>
            </Panel>
            <Panel id="add" mode={"card"}>
              <Group className={"panelHeight"} style={{ padding: "16px" }}>
                <PanelHeaderBack
                  label="Назад"
                  onClick={() => setActivePanel("main")}
                  style={{ marginBottom: "16px", marginTop: "25px" }}
                />
                <Input
                  value={currentTodo.title}
                  onChange={(e) =>
                    setCurrentTodo({ ...currentTodo, title: e.target.value })
                  }
                  style={{ marginBottom: "16px", marginTop: "16px" }}
                />
                <Textarea
                  cols={20}
                  rows={3}
                  value={currentTodo.text}
                  onChange={(e) =>
                    setCurrentTodo({ ...currentTodo, text: e.target.value })
                  }
                  style={{ marginBottom: "16px" }}
                />
                <Button onClick={() => addTodo()} style={{ marginTop: "10px" }}>
                  Сохранить
                </Button>
              </Group>
            </Panel>
            <Panel id="edit" mode={"card"}>
              <Group className={"panelHeight"} style={{ padding: "16px" }}>
                <PanelHeaderBack
                  label="Назад"
                  onClick={() => setActivePanel("main")}
                  style={{ marginBottom: "16px", marginTop: "25px" }}
                />
                <Input
                  value={todoToEdit.title}
                  onChange={(e) =>
                    setTodoToEdit({ ...todoToEdit, title: e.target.value })
                  }
                  style={{ marginBottom: "16px", marginTop: "16px" }}
                />
                <Textarea
                  cols={20}
                  rows={3}
                  value={todoToEdit.text}
                  onChange={(e) =>
                    setTodoToEdit({ ...todoToEdit, text: e.target.value })
                  }
                  style={{ marginBottom: "16px" }}
                />
                <Button onClick={() => editTodo()}>Сохранить</Button>
              </Group>
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>

      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id={"delete"}
          onClose={() => setActiveModal(null)}
          header="Уалить"
          subheader="Вы уверенны что хотите удалить эту запись?"
          actions={
            <Fragment>
              <Spacing size={16} />
              <Button
                size="l"
                mode="primary"
                stretched
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
