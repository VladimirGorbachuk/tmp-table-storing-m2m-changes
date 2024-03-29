const SELECTED_USERS_ENDPOINT = "/api/selected_users/"
const USERS_ENDPOINT = "/api/users"
const ADD_SELECTED_ENDPOINT = "/api/add_users_to_tmp/"
const REMOVE_SELECTED_ENDPOINT = "/api/remove_users_from_tmp/"

const LIMIT_PER_PAGE = 10


const calcPages = (total_users) => {
    let total = Math.floor(total_users / LIMIT_PER_PAGE)
    if(total_users % LIMIT_PER_PAGE > 0){
        total += 1
    }
    return total;
}


const getUsersResp = async ({substring, page}) => {
   const pageIdx = !! page ? page : 0;
   const searchStr = !! substring ? substring : "";
   const limit = LIMIT_PER_PAGE;
   const offset = pageIdx*limit;
   const response = await fetch(
    `${USERS_ENDPOINT}?limit=${limit}&offset=${offset}&search=${searchStr}`
   );
   const json = await response.json();
   return json;
};


const getSelectedUsersResp = async ({substring, page}) => {
    const pageIdx = !! page ? page : 0;
    const searchStr = !! substring ? substring : "";
    const limit = LIMIT_PER_PAGE;
    const offset = pageIdx*limit;
    const response = await fetch(
     `${SELECTED_USERS_ENDPOINT}?limit=${limit}&offset=${offset}&search=${searchStr}`
    );
    const json = await response.json();
    return json;
 };


const removeSelected = async (ids, csrfToken) => {
    const response = await fetch(
        REMOVE_SELECTED_ENDPOINT,
        {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({selected_ids: ids, 'X-CSRFToken': csrfToken}),
        },
    );
    return
}


const addSelected = async (ids, csrfToken) => {
    const response = await fetch(
        ADD_SELECTED_ENDPOINT,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-CSRFToken': csrfToken
              },
            body: JSON.stringify({selected_ids: ids, 'X-CSRFToken': csrfToken}),
        },
    );
    return
}



const userInfoToOptionRepr = ({id, username, email, date_joined, is_active, is_selected}) => {
    return `
       <tr data-value=${id}>
         <td class="action-checkbox"><input type="checkbox" name="_selected_action" value="1"
            class="action-select" aria-label="Select this object for an action - admin"></td>
         <th scope="row">${username}</th> 
         <td class="field-username"> ${email} </td>
         <td class="field-username">${date_joined}<td> 
         <td class="field-username"> ${is_active}</td>
         <td class="field-username"> ${is_selected} </td>
       </tr>
    `
}


const usersRepr = (users) => {
    const tableHead = `
        <thead>
            <tr>
            <th scope="col" class="action-checkbox-column">
                <div class="text"><span><input type="checkbox" id="action-toggle"
                        aria-label="Select all objects on this page for an action"></span></div>
                <div class="clear"></div>
            </th>
            <th scope="col" class="sortable" >#</th>
            <th scope="col" class="sortable" >username</th>
            <th scope="col" class="sortable" >date_joined</th>
            <th scope="col" class="sortable" >active</th>
            <th scope="col" class="sortable" >selected</th>
            </tr>
        </thead>
    `

    let reprRows = "";
    for(let user of users){
        reprRows += userInfoToOptionRepr(user);
    }
    return tableHead + reprRows;
}


function* rangeSimple(first, last){
    for (let i = first; i<last; i++){
        yield i;
    }
}


const reprButton = (idx) => `<button class=Paginator value=${idx}>${idx+1}</button>`;


const reprButtons = ({total, current, totalUsers}) => {
    let repr = ""
    if(total <= 10){
       for(let buttonNum of rangeSimple(0, total)){
           repr += reprButton(buttonNum)
       }
       return repr + ` Всего: ${totalUsers}`;
    }
    if(current < 5){
        for(let buttonNum of rangeSimple(0, 10)){
            repr += reprButton(buttonNum)
        }
        repr += "<span>...</span>";
        repr += reprButton(total-1);
        return repr + ` Всего: ${totalUsers}`;
    }
    if(total > current + 5){
        repr += reprButton(0);
        repr += "<span>...</span>";
        for(let buttonNum of rangeSimple(current-5, current+5)){
            repr += reprButton(buttonNum)
        }
        repr += "<span>...</span>";
        repr += reprButton(total-1);
        return repr + ` Всего: ${totalUsers}`;
    }
    repr += reprButton(0);
    repr += "<span>...</span>";
    for(let buttonNum of rangeSimple(current-5, total)){
        repr += reprButton(buttonNum)
    }
    return repr + ` Всего: ${totalUsers}`;
}


class UsersState{
    constructor(fetchedUsers = [], selectedUsers = [], totalFetchedUsers = 0){
        this.fetchedUsers = fetchedUsers;
        this.selectedUsers = selectedUsers;
        this.totalFetchedUsers = totalFetchedUsers;
    }
    setFetchedUsers({fetchedUsers, totalFetchedUsers}){
        this.fetchedUsers = fetchedUsers;
        for(let user of this.fetchedUsers){
            user.is_selected = user.is_selected;
        }
        this.totalFetchedUsers = totalFetchedUsers;
    };
    setSelectedUsers({selectedUsers, totalSelectedUsers}){
        this.selectedUsers = selectedUsers;
        for(let user of this.selectedUsers){
            user.is_selected = user.is_selected;
        }
        this.totalSelectedUsers = totalSelectedUsers;
    };
}


class PaginationSearchFetcher{
    //updates users state whenever we change current page
    // we could use something like has new info flag
    constructor(usersState, currentPage=0, searchStr=""){
        this.usersState = usersState;
        this.currentPage = currentPage;
        this.searchStr = searchStr;
    }
    async getInitialUsers(){
        const userResp = await getUsersResp({substring: this.searchStr, page: this.currentPage})
        this.usersState.setFetchedUsers({fetchedUsers: userResp.results, totalFetchedUsers: userResp.count})
    }
    async setCurrentPage(pageIdx){
        if(this.currentPage === pageIdx){return}
        const userResp = await getUsersResp({substring: this.searchStr, page: pageIdx})
        this.usersState.setFetchedUsers({fetchedUsers: userResp.results, totalFetchedUsers: userResp.count})
        this.currentPage = pageIdx;
    }
    async setSearchStr(searchStr){
        if(this.searchStr === searchStr){return}
        const userResp = await getUsersResp({substring: searchStr, page: this.currentPage})
        this.usersState.setFetchedUsers({fetchedUsers: userResp.results, totalFetchedUsers: userResp.count})
        this.searchStr = searchStr;
    }

    getUsersToDisplay(){
        return this.usersState.fetchedUsers;
    }
    getTotalPages(){
       return calcPages(this.usersState.totalFetchedUsers)
    }
    getTotalUsers(){
        return this.usersState.totalFetchedUsers;
    }
}


class PaginationSelectedState{
    constructor(usersState, currentPage = 0, searchStr = ""){
        this.usersState=usersState;
        this.currentPage=currentPage;
        this.searchStr=searchStr;
    }
    async getInitialUsers(){
        const userResp = await getSelectedUsersResp({substring: this.searchStr, page: this.currentPage})
        this.usersState.setSelectedUsers({selectedUsers: userResp.results, totalSelectedUsers: userResp.count})
    }
    async setCurrentPage(pageIdx){
        if(this.currentPage === pageIdx){return}
        const userResp = await getSelectedUsersResp({substring: this.searchStr, page: pageIdx})
        this.usersState.setSelectedUsers({selectedUsers: userResp.results, totalSelectedUsers: userResp.count})
        this.currentPage = pageIdx;
    }
    async setSearchStr(searchStr){
        if(this.searchStr === searchStr){return}
        const userResp = await getSelectedUsersResp({substring: searchStr, page: this.currentPage})
        this.usersState.setSelectedUsers({selectedUsers: userResp.results, totalSelectedUsers: userResp.count})
        this.searchStr = searchStr;
    }

    getUsersToDisplay(){
        return this.usersState.selectedUsers;
    }
    getTotalPages(){
       return calcPages(this.usersState.totalSelectedUsers);
    }
    getTotalUsers(){
        return this.usersState.totalSelectedUsers;
    }
}


class UsersRenderer{
   constructor(elementSelector){
      this.paginationFetchedElement = elementSelector.paginationFetchedElement;
      this.paginationSelectedElement = elementSelector.paginationSelectedElement
      this.usersFetchedElement = elementSelector.usersFetchedElement;
      this.usersSelectedElement = elementSelector.usersSelectedElement;
      this.fetchedState = {currentPage: 0, totalPages: 0, users: [], totalUsers: 0};
      this.selectedState = {currentPage: 0, totalPages: 0, users: [], totalUsers: 0};
      // should add last rendered and comparison before rendering
   }
   setPaginationFetched(paginatorFetched){
     if(
        this.fetchedState.currentPage === paginatorFetched.currentPage 
        && this.fetchedState.totalPages === paginatorFetched.getTotalPages()
        && this.fetchedState.totalUsers === paginatorFetched.getTotalUsers()
    ){
        return;
     }
     this.paginationFetchedElement.innerHTML = reprButtons(
        {
            total: paginatorFetched.getTotalPages(),
            current: paginatorFetched.currentPage,
            totalUsers: paginatorFetched.getTotalUsers(),
        },
     );
     this.fetchedState.currentPage = paginatorFetched.currentPage;
     this.fetchedState.totalPages = paginatorFetched.getTotalPages();
   }
   setPaginationSelected(paginatorSelect){
    if(
        this.selectedState.currentPage === paginatorSelect.currentPage 
        && this.selectedState.totalPages === paginatorSelect.getTotalPages()
        && this.selectedState.totalUsers === paginatorSelect.getTotalUsers()
    ){
        return;
     }
      this.paginationSelectedElement.innerHTML = reprButtons(
        {
            total: paginatorSelect.getTotalPages(),
            current: paginatorSelect.currentPage,
            totalUsers: paginatorSelect.getTotalUsers(),
        },
      );
      this.selectedState.currentPage = paginatorSelect.currentPage;
      this.selectedState.totalPages = paginatorSelect.getTotalPages();
   }
   setFetchedUsers(users){
    if(this.fetchedState.users === JSON.stringify(users)){
        return;
    }
    this.usersFetchedElement.innerHTML = usersRepr(users);
    this.fetchedState.users = JSON.stringify(users);
   }
   setSelectedUsers(users){
    if(this.selectedState.users === JSON.stringify(users)){
        return;
    }
    this.usersSelectedElement.innerHTML = usersRepr(users);
    this.selectedState.users = JSON.stringify(users);
   }
}


class UsersUseCases{
    // should move csrfToken to fetching class
    constructor({usersState, paginatorSearch, paginatorSelect, renderer, csrfToken}){
        this.paginatorSearch = paginatorSearch;
        this.paginatorSelect = paginatorSelect;
        this.renderer = renderer;
        this.usersState = usersState;
        this.csrfToken = csrfToken;
    }
    async getInitialState(){
        await this.paginatorSearch.getInitialUsers();
        await this.paginatorSelect.getInitialUsers();
        this.updateRenderer();
    }
    updateRenderer(){
        this.renderer.setPaginationFetched(this.paginatorSearch)
        this.renderer.setPaginationSelected(this.paginatorSelect)
        this.renderer.setFetchedUsers(this.paginatorSearch.getUsersToDisplay())
        this.renderer.setSelectedUsers(this.paginatorSelect.getUsersToDisplay())
    }
    async selectUser(userId){
        await addSelected([userId], this.csrfToken);
        this.getInitialState();
    }
    async unselectUser(userId){
        await removeSelected([userId], this.csrfToken);
        this.getInitialState();
    }
    async setSearchFilterStr(substring){
        await this.paginatorSearch.setSearchStr(substring);
        this.updateRenderer();
    }
    async setSelectedFilterStr(substring){
        await this.paginatorSelect.setSearchStr(substring);
        this.updateRenderer();
    }
    async setSearchPage(pageIdx){
        await this.paginatorSearch.setCurrentPage(pageIdx);
        this.updateRenderer();
    }
    async setSelectedPage(pageIdx){
        await this.paginatorSelect.setCurrentPage(pageIdx);
        this.updateRenderer();
    }
}


class ElementSelector{
    constructor({
        paginationFetchedElementId,
        paginationSelectedElementId,
        usersFetchedElementId,
        usersSelectedElementId,
        paginationFetchedSearchBarElementId,
        paginationSelectedSearchBarElementId,
        searchFetchedFormId,
        searchSelectedFormId,
        csrfElementName,
    }){
        this.paginationFetchedElement = document.getElementById(paginationFetchedElementId)
        this.paginationSelectedElement = document.getElementById(paginationSelectedElementId)
        this.usersFetchedElement = document.getElementById(usersFetchedElementId)
        this.usersSelectedElement = document.getElementById(usersSelectedElementId)
        this.paginationFetchedSearchBarElement = document.getElementById(paginationFetchedSearchBarElementId)
        this.paginationSelectedSearchBarElement = document.getElementById(paginationSelectedSearchBarElementId)
        this.searchFetchedForm = document.getElementById(searchFetchedFormId)
        this.searchSelectedForm = document.getElementById(searchSelectedFormId)
        this.csrfElement = document.getElementsByName(csrfElementName)[0]
    }
}


const wireChangeFetchPageForButton = ({elementSelector, useCases}) => {
    elementSelector.paginationFetchedElement.addEventListener(
        "click", 
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const element = event.target;
            const pageNum = parseInt(element.value)
            await useCases.setSearchPage(pageNum)
        },
    )
}


const wireChangeSelectPageForButton = ({elementSelector, useCases}) => {
    elementSelector.paginationSelectedElement.addEventListener(
        "click", 
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const element = event.target;
            const pageNum = parseInt(element.value)
            await useCases.setSelectedPage(pageNum)
        },
    )
}


const wireClickOnFetchedUser = ({elementSelector, useCases}) => {
    elementSelector.usersFetchedElement.addEventListener(
        "click", 
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const element = event.target;
            const row = element.parentElement;
            const userId = parseInt(row.dataset.value)
            await useCases.selectUser(userId)
        },
    )
}



const wireClickOnSelectedUser = ({elementSelector, useCases}) => {
    elementSelector.usersSelectedElement.addEventListener(
        "click", 
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const element = event.target;
            const row = element.parentElement;
            const userId = parseInt(row.dataset.value)
            await useCases.unselectUser(userId)
        },
    )
}


const wireSubmitFetchSearch = ({elementSelector, useCases}) => {
    elementSelector.searchFetchedForm.addEventListener(
        "submit", 
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await useCases.setSearchFilterStr(elementSelector.paginationFetchedSearchBarElement.value);
        },
    )
}


const wireSubmitSelectSearch = ({elementSelector, useCases}) => {
    elementSelector.searchSelectedForm.addEventListener(
        "submit", 
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await useCases.setSelectedFilterStr(
                elementSelector.paginationSelectedSearchBarElement.value,
            );
        },
    )
}


const initializeAll = async ({
    paginationFetchedElementId,
    paginationSelectedElementId,
    usersFetchedElementId,
    usersSelectedElementId,
    paginationFetchedSearchBarElementId,
    paginationSelectedSearchBarElementId,
    searchFetchedFormId,
    searchSelectedFormId,
    csrfElementName,
}) => {
    const elementSelector = new ElementSelector({
        paginationFetchedElementId: paginationFetchedElementId,
        paginationSelectedElementId: paginationSelectedElementId,
        usersFetchedElementId: usersFetchedElementId,
        usersSelectedElementId: usersSelectedElementId,
        paginationFetchedSearchBarElementId: paginationFetchedSearchBarElementId,
        paginationSelectedSearchBarElementId: paginationSelectedSearchBarElementId,
        searchFetchedFormId: searchFetchedFormId,
        searchSelectedFormId: searchSelectedFormId,
        csrfElementName: csrfElementName,
    });
    const usersState = new UsersState();
    const paginationSearchFetcher = new PaginationSearchFetcher(usersState);
    const paginationSelector = new PaginationSelectedState(usersState);
    const renderer = new UsersRenderer(elementSelector);
    const useCases = new UsersUseCases({
        usersState: usersState,
        paginatorSearch: paginationSearchFetcher,
        paginatorSelect: paginationSelector,
        renderer: renderer,
        csrfToken: elementSelector.csrfElement.value, // move to separate fetcher class
    })
    await useCases.getInitialState();
    wireChangeFetchPageForButton({
        elementSelector:elementSelector,
        useCases:useCases,
    });
    wireChangeSelectPageForButton({
        elementSelector:elementSelector,
        useCases:useCases,
    });
    wireSubmitFetchSearch({
        elementSelector:elementSelector,
        useCases:useCases,
    });
    wireSubmitSelectSearch({
        elementSelector:elementSelector,
        useCases:useCases,
    });
    wireClickOnFetchedUser({
        elementSelector:elementSelector,
        useCases:useCases,
    });
    wireClickOnSelectedUser({
        elementSelector:elementSelector,
        useCases:useCases,
    });
}

(async () => {
    try {
        await initializeAll({
                paginationFetchedElementId: "paginatorFetched",
                paginationSelectedElementId: "paginatorSelected",
                usersFetchedElementId: "itemsFetched",
                usersSelectedElementId: "itemsSelected",
                paginationFetchedSearchBarElementId: "fetchSearchString",
                paginationSelectedSearchBarElementId: "selectSearchString",
                csrfElementName: "csrfmiddlewaretoken",
                searchFetchedFormId: "changelist-search-fetched",
                searchSelectedFormId: "changelist-search-selected",
            });
    } catch (e) {
        console.error(e);
    }
})();
