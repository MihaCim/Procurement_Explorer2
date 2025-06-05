package database

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

type (
	Config struct {
		Host     string `json:"host"`
		User     string `json:"user"`
		Pass     string `json:"pass"`
		Port     string `json:"port"`
		Database string `json:"database"`
	}

	Site struct {
		Id        int
		Name      string
		Url       string
		Data      string
		Status    string
		Progress  string
		CreatedAt string
		UpdatedAt string
	}

	AddSite struct {
		Name string
		Url  string
		Data string
	}

	File struct {
		Id   int
		Name string
		Data []byte
	}
)

var (
	db *sql.DB
)

func GetConnection(c Config) *sql.DB {
	if db != nil {
		return db
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		c.Host,
		c.Port,
		c.User,
		c.Pass,
		c.Database,
	)
	fmt.Println("DSN:", dsn)
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		panic(err.Error())
	}
	err = db.Ping()
	if err != nil {
		panic(err.Error())
	}

	return db
}

// Functionality related to Site Management

func AddSites(sites []AddSite) error {
	stmtIns, err := db.Prepare("INSERT INTO sites (name, url, data, status, progress, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7 )")
	if err != nil {
		return err
	}
	defer stmtIns.Close()

	for _, v := range sites {
		_, err = stmtIns.Exec(v.Name, v.Url, v.Data, "pending", "", time.Now(), time.Now()) // Insert tuples (i, i^2)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetSites() ([]Site, error) {
	rows, err := db.Query("SELECT id,name,url,status,progress,created_at,updated_at FROM sites")
	if err != nil {
		return nil, err
	}
	sites := []Site{}
	for rows.Next() {
		var site Site
		err = rows.Scan(&site.Id, &site.Name, &site.Url, &site.Status, &site.Progress, &site.CreatedAt, &site.UpdatedAt)
		if err != nil {
			return nil, err
		}
		sites = append(sites, site)
	}
	return sites, nil
}

func GetPendingSites() ([]Site, error) {
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}

	rows, err := tx.Query(`SELECT id, url FROM sites WHERE status like 'pending' LIMIT 5`)
	if err != nil {
		return nil, err
	}

	sites := []Site{}
	for rows.Next() {
		var site Site
		err = rows.Scan(&site.Id, &site.Url)
		if err != nil {
			return nil, err
		}
		sites = append(sites, site)
	}
	for _, s := range sites {
		tx.Exec(`UPDATE sites SET status='scheduled', updated_at = $1 where id = $2`, time.Now(), s.Id)
	}
	tx.Commit()
	return sites, nil
}

func GetSiteById(id int) (Site, error) {
	site := Site{}
	err := db.QueryRow("SELECT id,name,url,data,status,progress,created_at,updated_at FROM sites where id = $1", id).Scan(
		&site.Id,
		&site.Name,
		&site.Url,
		&site.Data,
		&site.Status,
		&site.Progress,
		&site.CreatedAt,
		&site.UpdatedAt,
	)
	if err != nil {
		return Site{}, err
	}
	return site, nil
}

func DuplicateSite(id int, url string) (bool, error) {
	tx, err := db.Begin()
	if err != nil {
		return true, err
	}

	rows, err := tx.Query("SELECT id,url,status FROM sites WHERE url = $1", url)
	if err != nil {
		return true, err
	}

	sites := []Site{}
	for rows.Next() {
		var site Site
		err = rows.Scan(&site.Id, &site.Url, &site.Status)
		if err != nil {
			return true, err
		}
		sites = append(sites, site)
	}
	processed := false
	for _, s := range sites {
		if s.Id != id && (s.Status == "processing" || s.Status == "done") {
			tx.Exec(`UPDATE sites SET status='duplicate', updated_at = $1 where id = $2`, time.Now(), id)
			processed = true
		}
	}

	tx.Commit()
	return processed, nil
}

func UpdateSite(site Site) error {
	_, err := db.Exec(
		`UPDATE sites SET status = $1, progress = $2, updated_at = $3 where id = $4`,
		site.Status,
		site.Progress,
		time.Now(),
		site.Id,
	)
	return err
}

// Functionality related to File Management

func UploadFile(name string, data []byte) error {
	query := `
	INSERT INTO raw_data (name, data) 
	VALUES ($1, $2) 
	ON CONFLICT (name) DO UPDATE 
	SET data = EXCLUDED.data;`
	_, err := db.Exec(query, name, data)
	return err
}

func GetFile(name string) ([]byte, error) {
	var data []byte
	query := `SELECT data FROM raw_data WHERE name = $1`
	err := db.QueryRow(query, name).Scan(&data)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("file not found")
		}
		return nil, err
	}
	return data, nil
}
